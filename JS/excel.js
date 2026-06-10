/**
 * excel.js
 * ============================================
 * مكتبة قراءة وتصدير ملفات Excel
 * تعتمد على مكتبة SheetJS (XLSX)
 * تدعم شكلين:
 *   1. الشكل الطولي (Row-Based) - كل يوم صف منفصل
 *   2. الشكل المصفوفي (Matrix Layout) - كل موظف صف واحد
 * ============================================
 */

const ExcelReader = {

    /**
     * التحقق من وجود مكتبة XLSX
     * لا تستخدم alert هنا لتجنب مشاكل التحميل
     */
    checkXLSX: function() {
        if (typeof XLSX === 'undefined') {
            console.error('ERROR: مكتبة SheetJS (XLSX) غير محملة!');
            console.error('يرجى التأكد من وجود: <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>');
            return false;
        }
        return true;
    },

    /**
     * قراءة ملف Excel وتحويله إلى مصفوفة JSON
     * يكتشف تلقائياً الشكل (طولي أو مصفوفي)
     * @param {File} file - ملف Excel المرفوع من المستخدم
     * @param {Array} requiredColumns - الأعمدة المطلوبة للتحقق من صحة الملف (للشكل الطولي)
     * @returns {Promise} كائن يحتوي على {success, data, error, columns, layout}
     */
    readFile: function(file, requiredColumns) {
        return new Promise((resolve) => {
            if (!this.checkXLSX()) {
                resolve({ success: false, error: 'مكتبة XLSX غير محملة. يرجى التأكد من الاتصال بالإنترنت.', data: null });
                return;
            }

            if (!file) {
                resolve({ success: false, error: 'لم يتم اختيار أي ملف', data: null });
                return;
            }

            // التحقق من صيغة الملف
            const isValidExt = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
            if (!isValidExt) {
                resolve({
                    success: false,
                    error: 'صيغة الملف غير صالحة. يجب أن يكون بصيغة .xlsx أو .xls',
                    data: null
                });
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                        resolve({ success: false, error: 'الملف لا يحتوي على أي ورقة عمل', data: null });
                        return;
                    }

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // قراءة البيانات كـ Array of Arrays
                    const rawData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        defval: '',
                        blankrows: false
                    });

                    if (rawData.length === 0) {
                        resolve({ success: false, error: 'الملف فارغ لا يحتوي على بيانات', data: null });
                        return;
                    }

                    // ───────────────────────────────────────────
                    // اكتشاف الشكل تلقائياً
                    // ───────────────────────────────────────────
                    const layout = this.detectLayout(rawData[0]);

                    let records;
                    if (layout === 'matrix') {
                        // الشكل المصفوفي - كل موظف صف واحد
                        records = this.parseMatrixLayout(rawData);
                    } else {
                        // الشكل الطولي - كل يوم صف منفصل
                        records = this.parseRowLayout(rawData, requiredColumns);
                    }

                    if (!records.success) {
                        resolve(records);
                        return;
                    }

                    resolve({
                        success: true,
                        data: records.data,
                        columns: records.columns,
                        layout: layout,
                        error: null
                    });

                } catch (err) {
                    resolve({
                        success: false,
                        error: 'حدث خطأ أثناء قراءة الملف: ' + err.message,
                        data: null
                    });
                }
            };

            reader.onerror = () => {
                resolve({ success: false, error: 'فشل في قراءة الملف من الجهاز', data: null });
            };

            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * اكتشاف شكل الملف تلقائياً
     * @param {Array} headerRow - الصف الأول (عناوين الأعمدة)
     * @returns {String} 'matrix' أو 'row'
     */
    detectLayout: function(headerRow) {
        if (!headerRow || headerRow.length === 0) return 'row';

        const headers = headerRow.map(h => String(h).trim());

        // إذا كان الصف الأول يحتوي على "الرقم الوظيفي" و"التاريخ" → شكل طولي
        const hasEmpId = headers.includes('الرقم الوظيفي') || headers.includes('EmployeeID');
        const hasDate = headers.includes('التاريخ') || headers.includes('Date');

        if (hasEmpId && hasDate) {
            return 'row';
        }

        // إذا كان الصف الأول يحتوي على "الرقم الوظيفي" و"الاسم" فقط في البداية
        // ثم أعمدة متعددة للأيام → شكل مصفوفي
        if (hasEmpId && headers.length > 6) {
            return 'matrix';
        }

        // افتراض افتراضي: إذا كان عدد الأعمدة كبير (>10) → مصفوفي
        if (headers.length > 10) {
            return 'matrix';
        }

        return 'row';
    },

    /**
     * تحليل الشكل الطولي (Row-Based)
     * كل يوم = صف منفصل
     */
    parseRowLayout: function(rawData, requiredColumns) {
        const headers = rawData[0].map(h => String(h).trim());

        // التحقق من الأعمدة المطلوبة
        if (requiredColumns && requiredColumns.length > 0) {
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            if (missingColumns.length > 0) {
                return {
                    success: false,
                    error: 'الأعمدة التالية غير موجودة في الملف: ' + missingColumns.join('، '),
                    data: null,
                    columns: headers
                };
            }
        }

        const records = [];
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            const record = {};
            for (let j = 0; j < headers.length; j++) {
                const header = headers[j];
                const value = row[j];
                record[header] = (value !== undefined && value !== null) ? value : '';
            }
            records.push(record);
        }

        return { success: true, data: records, columns: headers };
    },

    /**
     * تحليل الشكل المصفوفي (Matrix Layout)
     * كل موظف = صف واحد، كل يوم = 4 أعمدة
     * 
     * هيكل الملف المتوقع:
     * الصف 1: [الرقم الوظيفي, الاسم, 01-Jun, 01-Jun, 01-Jun, 01-Jun, 02-Jun, ...]
     * الصف 2: [           ,     , MorningIn, MorningOut, EveningIn, EveningOut, ...]
     * الصف 3: [EMP001, أحمد, 08:00, 12:30, 15:00, 21:00, 08:00, ...]
     * 
     * أو بدون صف فرعي:
     * الصف 1: [الرقم الوظيفي, الاسم, 01-Jun MorningIn, 01-Jun MorningOut, ...]
     * الصف 2: [EMP001, أحمد, 08:00, 12:30, ...]
     */
    parseMatrixLayout: function(rawData) {
        const headers = rawData[0].map(h => String(h).trim());

        // التحقق من وجود الرقم الوظيفي والاسم
        const empIdCol = headers.findIndex(h => h === 'الرقم الوظيفي' || h === 'EmployeeID' || h === 'الرقم');
        const nameCol = headers.findIndex(h => h === 'الاسم' || h === 'EmployeeName' || h === 'Name');

        if (empIdCol === -1) {
            return {
                success: false,
                error: 'عمود "الرقم الوظيفي" غير موجود في الملف',
                data: null
            };
        }

        // ───────────────────────────────────────────
        // تحليل هيكل الأعمدة
        // ───────────────────────────────────────────

        // هل يوجد صف فرعي (صف ثانٍ يحتوي على MorningIn/MorningOut/...)؟
        let hasSubHeader = false;
        let subHeaders = [];
        let dataStartRow = 1;

        if (rawData.length > 1) {
            const secondRow = rawData[1].map(h => String(h).trim().toLowerCase());
            const hasShiftTypes = secondRow.some(h => 
                h.includes('morning') || h.includes('evening') || 
                h.includes('صباحي') || h.includes('مسائي') ||
                h.includes('in') || h.includes('out') ||
                h.includes('دخول') || h.includes('خروج')
            );
            if (hasShiftTypes) {
                hasSubHeader = true;
                subHeaders = secondRow;
                dataStartRow = 2;
            }
        }

        // ───────────────────────────────────────────
        // استخراج أيام العمل من الأعمدة
        // ───────────────────────────────────────────
        const dayColumns = []; // { day: '01-Jun', morningIn: colIndex, morningOut: colIndex, ... }

        if (hasSubHeader) {
            // هيكل بصف فرعي: اليوم في الصف الأول، نوع البصمة في الصف الثاني
            let currentDay = null;
            let currentDayObj = null;

            for (let col = 0; col < headers.length; col++) {
                if (col === empIdCol || col === nameCol) continue;

                const dayHeader = headers[col];
                const subHeader = subHeaders[col] || '';

                // إذا كان العمود يحتوي على تاريخ → بداية يوم جديد
                if (dayHeader && dayHeader.match(/\d{1,2}[-/]\w{3}[-/]\d{2,4}/) || 
                    dayHeader.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/)) {
                    currentDay = dayHeader;
                    currentDayObj = {
                        day: dayHeader,
                        morningIn: -1,
                        morningOut: -1,
                        eveningIn: -1,
                        eveningOut: -1
                    };
                    dayColumns.push(currentDayObj);
                }

                if (currentDayObj) {
                    const sub = subHeader.toLowerCase();
                    if (sub.includes('morningin') || sub.includes('morning_in') || sub.includes('صباحي') && sub.includes('دخول')) {
                        currentDayObj.morningIn = col;
                    } else if (sub.includes('morningout') || sub.includes('morning_out') || sub.includes('صباحي') && sub.includes('خروج')) {
                        currentDayObj.morningOut = col;
                    } else if (sub.includes('eveningin') || sub.includes('evening_in') || sub.includes('مسائي') && sub.includes('دخول')) {
                        currentDayObj.eveningIn = col;
                    } else if (sub.includes('eveningout') || sub.includes('evening_out') || sub.includes('مسائي') && sub.includes('خروج')) {
                        currentDayObj.eveningOut = col;
                    }
                }
            }
        } else {
            // هيكل بدون صف فرعي: أسماء الأعمدة تحتوي على اليوم + نوع البصمة
            // مثال: "01-Jun MorningIn", "01-Jun MorningOut", ...
            const dayMap = {}; // لتجميع الأعمدة حسب اليوم

            for (let col = 0; col < headers.length; col++) {
                if (col === empIdCol || col === nameCol) continue;

                const header = headers[col];

                // استخراج اليوم ونوع البصمة من اسم العمود
                // أنماط متوقعة: "01-Jun MorningIn", "01-Jun-MorningIn", "01-Jun Morning In"
                const match = header.match(/(\d{1,2}[-/]\w{3}[-/]?\d{0,4})\s*[-_]?\s*(.+)/i);

                if (match) {
                    const day = match[1];
                    const type = match[2].trim().toLowerCase().replace(/\s+/g, '');

                    if (!dayMap[day]) {
                        dayMap[day] = {
                            day: day,
                            morningIn: -1,
                            morningOut: -1,
                            eveningIn: -1,
                            eveningOut: -1
                        };
                        dayColumns.push(dayMap[day]);
                    }

                    if (type.includes('morningin') || type.includes('morning_in')) {
                        dayMap[day].morningIn = col;
                    } else if (type.includes('morningout') || type.includes('morning_out')) {
                        dayMap[day].morningOut = col;
                    } else if (type.includes('eveningin') || type.includes('evening_in')) {
                        dayMap[day].eveningIn = col;
                    } else if (type.includes('eveningout') || type.includes('evening_out')) {
                        dayMap[day].eveningOut = col;
                    }
                }
            }
        }

        if (dayColumns.length === 0) {
            return {
                success: false,
                error: 'لم يتم العثور على أعمدة أيام العمل في الملف. تأكد من تنسيق الأعمدة (مثال: 01-Jun MorningIn)',
                data: null
            };
        }

        // ───────────────────────────────────────────
        // تحويل البيانات إلى الشكل القياسي (Row-Based)
        // ───────────────────────────────────────────
        const records = [];

        for (let row = dataStartRow; row < rawData.length; row++) {
            const rowData = rawData[row];
            if (!rowData || rowData.length === 0) continue;

            const empId = rowData[empIdCol];
            if (!empId) continue; // تخطي الصفوف الفارغة

            const empName = nameCol !== -1 ? (rowData[nameCol] || '') : '';

            for (const dayCol of dayColumns) {
                const record = {
                    'الرقم الوظيفي': empId,
                    'الاسم': empName,
                    'التاريخ': dayCol.day,
                    'دخول صباحي': dayCol.morningIn !== -1 ? (rowData[dayCol.morningIn] || '') : '',
                    'خروج صباحي': dayCol.morningOut !== -1 ? (rowData[dayCol.morningOut] || '') : '',
                    'دخول مسائي': dayCol.eveningIn !== -1 ? (rowData[dayCol.eveningIn] || '') : '',
                    'خروج مسائي': dayCol.eveningOut !== -1 ? (rowData[dayCol.eveningOut] || '') : ''
                };
                records.push(record);
            }
        }

        return {
            success: true,
            data: records,
            columns: ['الرقم الوظيفي', 'الاسم', 'التاريخ', 'دخول صباحي', 'خروج صباحي', 'دخول مسائي', 'خروج مسائي']
        };
    },

    /**
     * تصدير مصفوفة JSON إلى ملف Excel وتنزيله
     * @param {Array} data - مصفوفة الكائنات المراد تصديرها
     * @param {String} filename - اسم الملف المطلوب (مع الامتداد .xlsx)
     * @param {String} sheetName - اسم ورقة العمل داخل الملف
     */
    exportToExcel: function(data, filename, sheetName) {
        if (!this.checkXLSX()) return;

        if (!data || data.length === 0) {
            console.warn('لا توجد بيانات متاحة للتصدير');
            return;
        }

        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'النتائج');
            XLSX.writeFile(workbook, filename || 'results.xlsx');
        } catch (err) {
            console.error('حدث خطأ أثناء تصدير الملف:', err.message);
        }
    }
};