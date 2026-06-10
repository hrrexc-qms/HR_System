/**
 * data-generator.js
 * ============================================
 * مولد بيانات تجريبية لنظام الحضور والرواتب
 * يدعم شكلين:
 *   1. الشكل الطولي (Row-Based)
 *   2. الشكل المصفوفي (Matrix Layout)
 * ============================================
 * 
 * طريقة الاستخدام:
 * 1. افتح index.html في المتصفح
 * 2. افتح Console (F12)
 * 3. انسخ هذا الملف وألصقه
 * 4. اكتب: DataGenerator.generateAll()
 * 5. سيتم تنزيل الملفات
 */

const DataGenerator = {

    // ───────────────────────────────────────────
    // بيانات الموظفين (10 موظفين)
    // ───────────────────────────────────────────
    employees: [
        { 'الرقم الوظيفي': 'EMP001', 'الاسم': 'أحمد محمد العلي',        'الراتب الأساسي': 3000, 'الراتب الشامل': 4500, 'رصيد الإجازات': 21 },
        { 'الرقم الوظيفي': 'EMP002', 'الاسم': 'خالد سعد الفهد',          'الراتب الأساسي': 2500, 'الراتب الشامل': 3800, 'رصيد الإجازات': 15 },
        { 'الرقم الوظيفي': 'EMP003', 'الاسم': 'فهد عبدالله الدوسري',    'الراتب الأساسي': 4000, 'الراتب الشامل': 6000, 'رصيد الإجازات': 30 },
        { 'الرقم الوظيفي': 'EMP004', 'الاسم': 'محمد سالم الحربي',        'الراتب الأساسي': 3500, 'الراتب الشامل': 5200, 'رصيد الإجازات': 18 },
        { 'الرقم الوظيفي': 'EMP005', 'الاسم': 'عبدالرحمن ناصر الشمري',  'الراتب الأساسي': 2800, 'الراتب الشامل': 4200, 'رصيد الإجازات': 12 },
        { 'الرقم الوظيفي': 'EMP006', 'الاسم': 'سعد علي المطيري',        'الراتب الأساسي': 3200, 'الراتب الشامل': 4800, 'رصيد الإجازات': 24 },
        { 'الرقم الوظيفي': 'EMP007', 'الاسم': 'بندر فهد القحطاني',     'الراتب الأساسي': 4500, 'الراتب الشامل': 6800, 'رصيد الإجازات': 10 },
        { 'الرقم الوظيفي': 'EMP008', 'الاسم': 'يوسف إبراهيم العتيبي',   'الراتب الأساسي': 3800, 'الراتب الشامل': 5700, 'رصيد الإجازات': 20 },
        { 'الرقم الوظيفي': 'EMP009', 'الاسم': 'طلال مشعل السبيعي',      'الراتب الأساسي': 2600, 'الراتب الشامل': 3900, 'رصيد الإجازات': 16 },
        { 'الرقم الوظيفي': 'EMP010', 'الاسم': 'ناصر حمد العنزي',        'الراتب الأساسي': 4200, 'الراتب الشامل': 6300, 'رصيد الإجازات': 25 },
    ],

    // ───────────────────────────────────────────
    // أنماط الحضور لكل موظف (30 يوم)
    // F=حضور كامل, L=تأخير, E=خروج مبكر, I=بصمة ناقصة
    // V=إجازة سنوية, S=إجازة مرضية, H=إجازة رسمية, A=غياب
    // ───────────────────────────────────────────
    patterns: {
        'EMP001': [
            'F','F','F','F','F', 'L','F','L','F','F',
            'E','F','I','F','F', 'V','V','V','F','F',
            'A','F','F','A','F', 'S','F','H','F','F',
        ],
        'EMP002': [
            'F','F','L','F','E', 'F','I','F','V','V',
            'F','A','F','F','L', 'F','S','F','H','F',
            'F','F','L','E','F', 'I','F','V','F','A',
        ],
        'EMP003': [
            'F','L','F','F','F', 'E','F','F','I','F',
            'V','V','F','F','A', 'F','S','F','H','F',
            'F','L','F','E','F', 'F','I','F','V','F',
        ],
        'EMP004': [
            'F','F','F','L','F', 'F','E','F','F','I',
            'F','V','F','A','F', 'S','F','H','F','F',
            'L','F','E','F','I', 'F','V','V','F','A',
        ],
        'EMP005': [
            'F','L','E','F','F', 'I','F','V','F','A',
            'F','S','F','H','F', 'F','L','F','E','I',
            'F','F','V','F','A', 'F','F','L','F','E',
        ],
        'EMP006': [
            'F','F','F','L','F', 'F','E','I','F','V',
            'F','A','F','S','H', 'F','F','L','F','E',
            'I','F','F','V','F', 'A','F','L','F','F',
        ],
        'EMP007': [
            'F','L','F','F','E', 'F','I','V','F','A',
            'F','S','F','H','F', 'L','F','E','I','F',
            'V','F','A','F','F', 'L','E','F','I','V',
        ],
        'EMP008': [
            'F','F','L','E','F', 'I','F','V','V','F',
            'A','F','S','F','H', 'F','L','F','E','I',
            'F','F','V','A','F', 'L','F','E','F','I',
        ],
        'EMP009': [
            'F','L','F','F','F', 'E','I','F','V','A',
            'F','S','H','F','F', 'L','F','E','I','F',
            'V','F','A','F','L', 'F','E','I','F','V',
        ],
        'EMP010': [
            'F','F','L','E','F', 'F','I','V','F','A',
            'S','F','H','F','L', 'E','F','I','V','F',
            'A','F','L','F','E', 'I','F','V','S','F',
        ],
    },

    // ───────────────────────────────────────────
    // توليد سجل بصمة واحد بناءً على النمط
    // ───────────────────────────────────────────
    generateRecord: function(empId, dayNum, pattern) {
        const date = '2025-06-' + String(dayNum).padStart(2, '0');

        switch (pattern) {
            case 'F': return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': '08:00', 'خروج صباحي': '12:30', 'دخول مسائي': '15:00', 'خروج مسائي': '21:00' };
            case 'L': return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': '08:15', 'خروج صباحي': '12:30', 'دخول مسائي': '15:10', 'خروج مسائي': '21:00' };
            case 'E': return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': '08:00', 'خروج صباحي': '12:15', 'دخول مسائي': '15:00', 'خروج مسائي': '20:45' };
            case 'I': return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': '08:00', 'خروج صباحي': '', 'دخول مسائي': '', 'خروج مسائي': '21:00' };
            case 'V': return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': 'إجازة سنوية', 'خروج صباحي': '', 'دخول مسائي': '', 'خروج مسائي': '' };
            case 'S': return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': 'إجازة مرضية', 'خروج صباحي': '', 'دخول مسائي': '', 'خروج مسائي': '' };
            case 'H': return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': 'إجازة رسمية', 'خروج صباحي': '', 'دخول مسائي': '', 'خروج مسائي': '' };
            case 'A': return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': '', 'خروج صباحي': '', 'دخول مسائي': '', 'خروج مسائي': '' };
            default:  return { 'الرقم الوظيفي': empId, 'التاريخ': date, 'دخول صباحي': '08:00', 'خروج صباحي': '12:30', 'دخول مسائي': '15:00', 'خروج مسائي': '21:00' };
        }
    },

    // ───────────────────────────────────────────
    // توليد ملف البصمة بالشكل الطولي
    // ───────────────────────────────────────────
    generateAttendanceRow: function() {
        const records = [];
        for (const empId in this.patterns) {
            const patterns = this.patterns[empId];
            for (let day = 0; day < patterns.length; day++) {
                records.push(this.generateRecord(empId, day + 1, patterns[day]));
            }
        }
        return records;
    },

    // ───────────────────────────────────────────
    // توليد ملف البصمة بالشكل المصفوفي (مع صف فرعي)
    // ───────────────────────────────────────────
    generateAttendanceMatrix: function() {
        const aoa = []; // Array of Arrays

        // الصف الأول: عناوين الأيام
        const headerRow1 = ['الرقم الوظيفي', 'الاسم'];
        for (let day = 1; day <= 30; day++) {
            headerRow1.push(String(day).padStart(2, '0') + '-Jun');
            headerRow1.push('');
            headerRow1.push('');
            headerRow1.push('');
        }
        aoa.push(headerRow1);

        // الصف الثاني: أنواع البصمات
        const headerRow2 = ['', ''];
        for (let day = 1; day <= 30; day++) {
            headerRow2.push('MorningIn');
            headerRow2.push('MorningOut');
            headerRow2.push('EveningIn');
            headerRow2.push('EveningOut');
        }
        aoa.push(headerRow2);

        // صفوف البيانات
        const empNames = {};
        this.employees.forEach(e => empNames[e['الرقم الوظيفي']] = e['الاسم']);

        for (const empId in this.patterns) {
            const row = [empId, empNames[empId] || ''];
            const patterns = this.patterns[empId];
            for (let day = 0; day < patterns.length; day++) {
                const times = this.getTimes(patterns[day]);
                row.push(times[0]); // MorningIn
                row.push(times[1]); // MorningOut
                row.push(times[2]); // EveningIn
                row.push(times[3]); // EveningOut
            }
            aoa.push(row);
        }

        return aoa;
    },

    // ───────────────────────────────────────────
    // توليد ملف البصمة بالشكل المصفوفي (بدون صف فرعي)
    // ───────────────────────────────────────────
    generateAttendanceMatrixComposite: function() {
        const aoa = [];

        // الصف الأول: أعمدة مركبة
        const headerRow = ['الرقم الوظيفي', 'الاسم'];
        for (let day = 1; day <= 30; day++) {
            const d = String(day).padStart(2, '0') + '-Jun';
            headerRow.push(d + ' MorningIn');
            headerRow.push(d + ' MorningOut');
            headerRow.push(d + ' EveningIn');
            headerRow.push(d + ' EveningOut');
        }
        aoa.push(headerRow);

        // صفوف البيانات
        const empNames = {};
        this.employees.forEach(e => empNames[e['الرقم الوظيفي']] = e['الاسم']);

        for (const empId in this.patterns) {
            const row = [empId, empNames[empId] || ''];
            const patterns = this.patterns[empId];
            for (let day = 0; day < patterns.length; day++) {
                const times = this.getTimes(patterns[day]);
                row.push(times[0]);
                row.push(times[1]);
                row.push(times[2]);
                row.push(times[3]);
            }
            aoa.push(row);
        }

        return aoa;
    },

    getTimes: function(pattern) {
        switch (pattern) {
            case 'F': return ['08:00', '12:30', '15:00', '21:00'];
            case 'L': return ['08:15', '12:30', '15:10', '21:00'];
            case 'E': return ['08:00', '12:15', '15:00', '20:45'];
            case 'I': return ['08:00', '', '', '21:00'];
            case 'V': return ['إجازة سنوية', '', '', ''];
            case 'S': return ['إجازة مرضية', '', '', ''];
            case 'H': return ['إجازة رسمية', '', '', ''];
            case 'A': return ['', '', '', ''];
            default:  return ['08:00', '12:30', '15:00', '21:00'];
        }
    },

    // ───────────────────────────────────────────
    // تصدير مصفوفة JSON إلى ملف Excel
    // ───────────────────────────────────────────
    exportWorkbook: function(data, filename, sheetName) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, filename);
    },

    // ───────────────────────────────────────────
    // تصدير Array of Arrays إلى ملف Excel
    // ───────────────────────────────────────────
    exportAOA: function(aoa, filename, sheetName) {
        const worksheet = XLSX.utils.aoa_to_sheet(aoa);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, filename);
    },

    // ───────────────────────────────────────────
    // توليد وتصدير ملف الموظفين
    // ───────────────────────────────────────────
    generateEmployees: function() {
        this.exportWorkbook(this.employees, 'employees.xlsx', 'الموظفين');
        console.log('✅ تم تصدير ملف الموظفين: employees.xlsx');
        console.log('   عدد الموظفين:', this.employees.length);
    },

    // ───────────────────────────────────────────
    // توليد وتصدير ملف البصمة بالشكل الطولي
    // ───────────────────────────────────────────
    generateAttendanceRowFile: function() {
        const attendanceData = this.generateAttendanceRow();
        this.exportWorkbook(attendanceData, 'attendance_row.xlsx', 'البصمة');
        console.log('✅ تم تصدير ملف البصمة (طولي): attendance_row.xlsx');
        console.log('   عدد السجلات:', attendanceData.length);
    },

    // ───────────────────────────────────────────
    // توليد وتصدير ملف البصمة بالشكل المصفوفي (مع صف فرعي)
    // ───────────────────────────────────────────
    generateAttendanceMatrixFile: function() {
        const aoa = this.generateAttendanceMatrix();
        this.exportAOA(aoa, 'attendance_matrix.xlsx', 'البصمة');
        console.log('✅ تم تصدير ملف البصمة (مصفوفي مع صف فرعي): attendance_matrix.xlsx');
        console.log('   عدد الصفوف:', aoa.length);
    },

    // ───────────────────────────────────────────
    // توليد وتصدير ملف البصمة بالشكل المصفوفي (بدون صف فرعي)
    // ───────────────────────────────────────────
    generateAttendanceMatrixCompositeFile: function() {
        const aoa = this.generateAttendanceMatrixComposite();
        this.exportAOA(aoa, 'attendance_matrix_composite.xlsx', 'البصمة');
        console.log('✅ تم تصدير ملف البصمة (مصفوفي مركب): attendance_matrix_composite.xlsx');
        console.log('   عدد الصفوف:', aoa.length);
    },

    // ───────────────────────────────────────────
    // توليد كل الملفات
    // ───────────────────────────────────────────
    generateAll: function() {
        console.log('🚀 بدء توليد البيانات التجريبية...');
        console.log('');
        this.generateEmployees();
        console.log('');
        this.generateAttendanceRowFile();
        console.log('');
        this.generateAttendanceMatrixFile();
        console.log('');
        this.generateAttendanceMatrixCompositeFile();
        console.log('');
        console.log('✅ اكتمل توليد جميع الملفات!');
    }
};