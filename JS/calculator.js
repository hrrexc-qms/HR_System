/**
 * calculator.js
 * ============================================
 * محرك حساب الحضور والغياب والتأخير والرواتب
 * دوال مستقلة وقابلة لإعادة الاستخدام
 * ============================================
 */

const Calculator = {

    /**
     * إعدادات الدوام الافتراضية
     */
    settings: {
        shift1In: '08:00',
        shift1Out: '12:30',
        shift2In: '15:00',
        shift2Out: '21:00',
        incompletePenalty: 50, // نسبة الخصم للبصمة الناقصة (%)
        dailyHours: 10.5
    },

    /**
     * تحديث إعدادات الدوام
     * @param {Object} newSettings - كائن يحتوي على الإعدادات الجديدة
     */
    updateSettings: function(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    },

    /**
     * تحويل نص الوقت إلى دقائق من منتصف الليل
     * @param {String} timeStr - نص الوقت بصيغة "HH:MM"
     * @returns {Number} عدد الدقائق من منتصف الليل
     */
    timeToMinutes: function(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return null;
        const parts = timeStr.trim().split(':');
        if (parts.length < 2) return null;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (isNaN(hours) || isNaN(minutes)) return null;
        return hours * 60 + minutes;
    },

    /**
     * التحقق مما إذا كانت القيمة تمثل إجازة
     * @param {String} value - قيمة الخلية
     * @returns {Boolean}
     */
    isLeave: function(value) {
        if (!value || typeof value !== 'string') return false;
        const leaveTypes = ['إجازة عيد', 'إجازة رسمية', 'إجازة سنوية', 'إجازة مرضية'];
        return leaveTypes.includes(value.trim());
    },

    /**
     * التحقق مما إذا كانت القيمة فارغة أو غير موجودة
     * @param {String} value - قيمة الخلية
     * @returns {Boolean}
     */
    isEmpty: function(value) {
        return value === '' || value === null || value === undefined;
    },

    /**
     * حساب الحضور لموظف واحد
     * اليوم يُعتبر حاضراً إذا كانت جميع البصمات موجودة (دخول وخروج لكلا الفترتين)
     * @param {Array} attendanceRecords - سجلات البصمة للموظف
     * @returns {Number} عدد أيام الحضور
     */
    calculateAttendance: function(attendanceRecords) {
        let count = 0;
        for (const record of attendanceRecords) {
            // إذا كان يوم إجازة لا يُحسب حضور
            if (this.isLeave(record['دخول صباحي']) ||
                this.isLeave(record['خروج صباحي']) ||
                this.isLeave(record['دخول مسائي']) ||
                this.isLeave(record['خروج مسائي'])) {
                continue;
            }
            // إذا كانت جميع البصمات موجودة → حضور
            if (!this.isEmpty(record['دخول صباحي']) &&
                !this.isEmpty(record['خروج صباحي']) &&
                !this.isEmpty(record['دخول مسائي']) &&
                !this.isEmpty(record['خروج مسائي'])) {
                count++;
            }
        }
        return count;
    },

    /**
     * حساب الغياب لموظف واحد
     * اليوم يُعتبر غياباً إذا كانت جميع البصمات فارغة
     * @param {Array} attendanceRecords - سجلات البصمة للموظف
     * @returns {Number} عدد أيام الغياب
     */
    calculateAbsence: function(attendanceRecords) {
        let count = 0;
        for (const record of attendanceRecords) {
            if (this.isEmpty(record['دخول صباحي']) &&
                this.isEmpty(record['خروج صباحي']) &&
                this.isEmpty(record['دخول مسائي']) &&
                this.isEmpty(record['خروج مسائي'])) {
                count++;
            }
        }
        return count;
    },

    /**
     * حساب الإجازات لموظف واحد
     * @param {Array} attendanceRecords - سجلات البصمة للموظف
     * @returns {Number} عدد أيام الإجازات
     */
    calculateLeaves: function(attendanceRecords) {
        let count = 0;
        for (const record of attendanceRecords) {
            if (this.isLeave(record['دخول صباحي']) ||
                this.isLeave(record['خروج صباحي']) ||
                this.isLeave(record['دخول مسائي']) ||
                this.isLeave(record['خروج مسائي'])) {
                count++;
            }
        }
        return count;
    },

    /**
     * حساب البصمات الناقصة لموظف واحد
     * يوم له بصمة واحدة أو اثنتين فقط (بدون أن يكون غياب كامل أو إجازة)
     * @param {Array} attendanceRecords - سجلات البصمة للموظف
     * @returns {Number} عدد أيام البصمات الناقصة
     */
    calculateIncomplete: function(attendanceRecords) {
        let count = 0;
        for (const record of attendanceRecords) {
            const morningIn = record['دخول صباحي'];
            const morningOut = record['خروج صباحي'];
            const eveningIn = record['دخول مسائي'];
            const eveningOut = record['خروج مسائي'];

            // تخطي أيام الغياب الكامل والإجازات
            if (this.isEmpty(morningIn) && this.isEmpty(morningOut) &&
                this.isEmpty(eveningIn) && this.isEmpty(eveningOut)) {
                continue;
            }
            if (this.isLeave(morningIn) || this.isLeave(morningOut) ||
                this.isLeave(eveningIn) || this.isLeave(eveningOut)) {
                continue;
            }

            // عدد البصمات الموجودة
            let presentCount = 0;
            if (!this.isEmpty(morningIn)) presentCount++;
            if (!this.isEmpty(morningOut)) presentCount++;
            if (!this.isEmpty(eveningIn)) presentCount++;
            if (!this.isEmpty(eveningOut)) presentCount++;

            // إذا كانت البصمات أقل من 4 (غير مكتملة) و أكثر من 0 (ليس غياب)
            if (presentCount > 0 && presentCount < 4) {
                count++;
            }
        }
        return count;
    },

    /**
     * حساب إجمالي دقائق التأخير لموظف واحد
     * التأخير = الدخول بعد الوقت الرسمي
     * @param {Array} attendanceRecords - سجلات البصمة للموظف
     * @returns {Number} إجمالي دقائق التأخير
     */
    calculateLateMinutes: function(attendanceRecords) {
        let totalLate = 0;
        const shift1InMin = this.timeToMinutes(this.settings.shift1In);
        const shift2InMin = this.timeToMinutes(this.settings.shift2In);

        for (const record of attendanceRecords) {
            // تخطي الإجازات والغياب
            if (this.isLeave(record['دخول صباحي'])) continue;
            if (this.isEmpty(record['دخول صباحي']) && this.isEmpty(record['دخول مسائي'])) continue;

            // تأخير الفترة الأولى
            const morningIn = this.timeToMinutes(record['دخول صباحي']);
            if (morningIn !== null && morningIn > shift1InMin) {
                totalLate += (morningIn - shift1InMin);
            }

            // تأخير الفترة الثانية
            const eveningIn = this.timeToMinutes(record['دخول مسائي']);
            if (eveningIn !== null && eveningIn > shift2InMin) {
                totalLate += (eveningIn - shift2InMin);
            }
        }
        return totalLate;
    },

    /**
     * حساب إجمالي دقائق الخروج المبكر لموظف واحد
     * الخروج المبكر = الخروج قبل الوقت الرسمي
     * @param {Array} attendanceRecords - سجلات البصمة للموظف
     * @returns {Number} إجمالي دقائق الخروج المبكر
     */
    calculateEarlyLeaveMinutes: function(attendanceRecords) {
        let totalEarly = 0;
        const shift1OutMin = this.timeToMinutes(this.settings.shift1Out);
        const shift2OutMin = this.timeToMinutes(this.settings.shift2Out);

        for (const record of attendanceRecords) {
            // تخطي الإجازات والغياب
            if (this.isLeave(record['خروج صباحي'])) continue;
            if (this.isEmpty(record['خروج صباحي']) && this.isEmpty(record['خروج مسائي'])) continue;

            // خروج مبكر الفترة الأولى
            const morningOut = this.timeToMinutes(record['خروج صباحي']);
            if (morningOut !== null && morningOut < shift1OutMin) {
                totalEarly += (shift1OutMin - morningOut);
            }

            // خروج مبكر الفترة الثانية
            const eveningOut = this.timeToMinutes(record['خروج مسائي']);
            if (eveningOut !== null && eveningOut < shift2OutMin) {
                totalEarly += (shift2OutMin - eveningOut);
            }
        }
        return totalEarly;
    },

    /**
     * حساب إجمالي ساعات العمل لموظف واحد
     * @param {Array} attendanceRecords - سجلات البصمة للموظف
     * @returns {Number} إجمالي ساعات العمل
     */
    calculateWorkingHours: function(attendanceRecords) {
        let totalHours = 0;

        for (const record of attendanceRecords) {
            // تخطي الإجازات والغياب
            if (this.isLeave(record['دخول صباحي']) ||
                this.isLeave(record['خروج صباحي']) ||
                this.isLeave(record['دخول مسائي']) ||
                this.isLeave(record['خروج مسائي'])) {
                continue;
            }

            const morningIn = this.timeToMinutes(record['دخول صباحي']);
            const morningOut = this.timeToMinutes(record['خروج صباحي']);
            const eveningIn = this.timeToMinutes(record['دخول مسائي']);
            const eveningOut = this.timeToMinutes(record['خروج مسائي']);

            let dayMinutes = 0;

            if (morningIn !== null && morningOut !== null && morningOut > morningIn) {
                dayMinutes += (morningOut - morningIn);
            }
            if (eveningIn !== null && eveningOut !== null && eveningOut > eveningIn) {
                dayMinutes += (eveningOut - eveningIn);
            }

            totalHours += (dayMinutes / 60);
        }

        return Math.round(totalHours * 100) / 100;
    },

    /**
     * حساب الخصومات لموظف واحد
     * @param {Object} employee - بيانات الموظف (الراتب الشامل)
     * @param {Object} stats - إحصائيات الحضور (غياب، تأخير، خروج مبكر، بصمة ناقصة)
     * @returns {Object} كائن يحتوي على تفاصيل الخصومات
     */
    calculateDeductions: function(employee, stats) {
        const totalSalary = parseFloat(employee['الراتب الشامل']) || 0;

        // قيمة اليوم = الراتب الشامل ÷ 30
        const dayValue = totalSalary / 30;

        // قيمة الساعة = قيمة اليوم ÷ 10.5
        const hourValue = dayValue / this.settings.dailyHours;

        // قيمة الدقيقة = قيمة الساعة ÷ 60
        const minuteValue = hourValue / 60;

        // خصم الغياب = أيام الغياب × قيمة اليوم
        const absenceDeduction = stats.absence * dayValue;

        // خصم التأخير = دقائق التأخير × قيمة الدقيقة
        const lateDeduction = stats.lateMinutes * minuteValue;

        // خصم الخروج المبكر = دقائق الخروج المبكر × قيمة الدقيقة
        const earlyDeduction = stats.earlyLeaveMinutes * minuteValue;

        // خصم البصمة الناقصة = أيام البصمة الناقصة × قيمة اليوم × (نسبة الخصم ÷ 100)
        const incompleteDeduction = stats.incomplete * dayValue * (this.settings.incompletePenalty / 100);

        // إجمالي الخصومات
        const totalDeductions = absenceDeduction + lateDeduction + earlyDeduction + incompleteDeduction;

        return {
            dayValue: Math.round(dayValue * 100) / 100,
            hourValue: Math.round(hourValue * 100) / 100,
            minuteValue: Math.round(minuteValue * 100) / 100,
            absenceDeduction: Math.round(absenceDeduction * 100) / 100,
            lateDeduction: Math.round(lateDeduction * 100) / 100,
            earlyDeduction: Math.round(earlyDeduction * 100) / 100,
            incompleteDeduction: Math.round(incompleteDeduction * 100) / 100,
            totalDeductions: Math.round(totalDeductions * 100) / 100
        };
    },

    /**
     * حساب صافي الراتب
     * @param {Number} totalSalary - الراتب الشامل
     * @param {Number} totalDeductions - إجمالي الخصومات
     * @returns {Number} صافي الراتب
     */
    calculateNetSalary: function(totalSalary, totalDeductions) {
        const net = parseFloat(totalSalary) - parseFloat(totalDeductions);
        // التأكد من عدم كون صافي الراتب سالباً
        return Math.max(0, Math.round(net * 100) / 100);
    },

    /**
     * معالجة جميع الموظفين وحساب نتائجهم
     * هذه الدالة الرئيسية التي تستدعي جميع الدوال الأخرى
     * @param {Array} employees - مصفوفة بيانات الموظفين
     * @param {Array} attendance - مصفوفة سجلات البصمة
     * @returns {Object} كائن يحتوي على نتائج كل موظف
     */
    processAll: function(employees, attendance) {
        const results = {};
        const unmatchedAttendance = []; // سجلات بصمة غير مرتبطة بموظف

        // التحقق من سجلات البصمة غير المرتبطة
        const employeeIds = new Set(employees.map(e => e['الرقم الوظيفي']));
        for (const att of attendance) {
            const attId = att['الرقم الوظيفي'];
            if (attId && !employeeIds.has(attId)) {
                unmatchedAttendance.push(attId);
            }
        }
        if (unmatchedAttendance.length > 0) {
            const uniqueUnmatched = [...new Set(unmatchedAttendance)];
            console.warn('تحذير: سجلات بصمة لموظفين غير موجودين في ملف الموظفين:', uniqueUnmatched);
        }

        for (const emp of employees) {
            const empId = emp['الرقم الوظيفي'];
            if (!empId) continue;

            // فلترة سجلات البصمة الخاصة بهذا الموظف
            const empAttendance = attendance.filter(a => a['الرقم الوظيفي'] === empId);

            if (empAttendance.length === 0) {
                console.warn('تحذير: لا توجد سجلات بصمة للموظف:', empId, '-', emp['الاسم']);
            }

            // حساب إحصائيات الحضور
            const attendanceDays = this.calculateAttendance(empAttendance);
            const absenceDays = this.calculateAbsence(empAttendance);
            const leaveDays = this.calculateLeaves(empAttendance);
            const incompleteDays = this.calculateIncomplete(empAttendance);
            const lateMinutes = this.calculateLateMinutes(empAttendance);
            const earlyMinutes = this.calculateEarlyLeaveMinutes(empAttendance);
            const workingHours = this.calculateWorkingHours(empAttendance);

            // حساب الخصومات
            const deductions = this.calculateDeductions(emp, {
                absence: absenceDays,
                lateMinutes: lateMinutes,
                earlyLeaveMinutes: earlyMinutes,
                incomplete: incompleteDays
            });

            // حساب صافي الراتب
            const totalSalary = parseFloat(emp['الراتب الشامل']) || 0;
            const netSalary = this.calculateNetSalary(totalSalary, deductions.totalDeductions);

            results[empId] = {
                empId: empId,
                name: emp['الاسم'] || '',
                basicSalary: parseFloat(emp['الراتب الأساسي']) || 0,
                totalSalary: totalSalary,

                // إحصائيات الحضور
                attendance: attendanceDays,
                absence: absenceDays,
                leaves: leaveDays,
                incomplete: incompleteDays,
                lateMinutes: lateMinutes,
                earlyLeaveMinutes: earlyMinutes,
                workingHours: workingHours,

                // تفاصيل الخصومات
                dayValue: deductions.dayValue,
                hourValue: deductions.hourValue,
                minuteValue: deductions.minuteValue,
                absenceDeduction: deductions.absenceDeduction,
                lateDeduction: deductions.lateDeduction,
                earlyDeduction: deductions.earlyDeduction,
                incompleteDeduction: deductions.incompleteDeduction,
                totalDeductions: deductions.totalDeductions,
                netSalary: netSalary
            };
        }

        return results;
    }
};