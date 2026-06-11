/**
 * app.js
 * ============================================
 * التطبيق الرئيسي - ربط الواجهة بالمنطق
 * ============================================
 */

const App = {

    // ───────────────────────────────────────────
    // إعدادات العملة
    // ───────────────────────────────────────────
    currency: {
        code: 'YER',        // كود العملة
        symbol: 'ر.ي',      // رمز العملة
        name: 'ريال يمني',   // اسم العملة
        decimals: 0,        // عدد الكسور (0 للريال اليمني)
        locale: 'ar-YE'     // اللغة والمنطقة
    },

    // ───────────────────────────────────────────
    // حالة التطبيق (State)
    // ───────────────────────────────────────────
    state: {
        employeesData: [],
        attendanceData: [],
        results: {},
        settings: {
            shift1In: '08:00',
            shift1Out: '12:30',
            shift2In: '15:00',
            shift2Out: '21:00',
            incompletePenalty: 50
        }
    },

    // ───────────────────────────────────────────
    // الأعمدة المطلوبة في كل ملف
    // ───────────────────────────────────────────
    requiredColumns: {
        employees: ['الرقم الوظيفي', 'الاسم', 'الراتب الأساسي', 'الراتب الشامل', 'رصيد الإجازات'],
        attendance: ['الرقم الوظيفي', 'التاريخ', 'دخول صباحي', 'خروج صباحي', 'دخول مسائي', 'خروج مسائي']
    },

    // ───────────────────────────────────────────
    // تهيئة التطبيق
    // ───────────────────────────────────────────
    init: function() {
        this.initDateDisplay();
        this.loadSettings();
        this.loadEmployeesFromStorage();
        this.bindEvents();
        this.bindSidebarNavigation();
        this.updateEmployeesUI();
    },

    // ───────────────────────────────────────────
    // عرض التاريخ الحالي
    // ───────────────────────────────────────────
    initDateDisplay: function() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const el = document.getElementById('currentDate');
        if (el) el.textContent = now.toLocaleDateString('ar-YE', options);
    },

    // ───────────────────────────────────────────
    // ربط الأحداث
    // ───────────────────────────────────────────
    bindEvents: function() {
        const empFile = document.getElementById('employeesFile');
        if (empFile) {
            empFile.addEventListener('change', (e) => this.handleEmployeesFile(e));
        }

        const attFile = document.getElementById('attendanceFile');
        if (attFile) {
            attFile.addEventListener('change', (e) => this.handleAttendanceFile(e));
        }

        const btnProcess = document.getElementById('btnProcess');
        if (btnProcess) {
            btnProcess.addEventListener('click', () => this.processAll());
        }

        const btnSave = document.getElementById('btnSaveSettings');
        if (btnSave) {
            btnSave.addEventListener('click', () => this.saveSettings());
        }

        const btnExport = document.getElementById('btnExportExcel');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.exportResults());
        }
    },

    // ───────────────────────────────────────────
    // التنقل بين الأقسام من Sidebar
    // ───────────────────────────────────────────
    bindSidebarNavigation: function() {
        document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.sidebar-menu .nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const targetId = this.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    },

    // ═══════════════════════════════════════════
    // بيانات الموظفين - LocalStorage
    // ═══════════════════════════════════════════

    saveEmployeesToStorage: function() {
        try {
            localStorage.setItem('attendance_employees', JSON.stringify(this.state.employeesData));
            localStorage.setItem('attendance_employees_timestamp', new Date().toISOString());
            console.log('✅ تم حفظ بيانات الموظفين في LocalStorage');
        } catch (e) {
            console.warn('⚠️ تعذر الحفظ في LocalStorage:', e.message);
        }
    },

    loadEmployeesFromStorage: function() {
        try {
            const saved = localStorage.getItem('attendance_employees');
            if (saved) {
                this.state.employeesData = JSON.parse(saved);
                const timestamp = localStorage.getItem('attendance_employees_timestamp');
                console.log('📦 تم تحميل بيانات الموظفين من LocalStorage:', this.state.employeesData.length, 'موظف');
                if (timestamp) {
                    console.log('   آخر تحديث:', new Date(timestamp).toLocaleString('ar-YE'));
                }
            }
        } catch (e) {
            console.warn('⚠️ تعذر قراءة بيانات الموظفين من LocalStorage:', e.message);
            this.state.employeesData = [];
        }
    },

    clearEmployeesStorage: function() {
        try {
            localStorage.removeItem('attendance_employees');
            localStorage.removeItem('attendance_employees_timestamp');
            this.state.employeesData = [];
            console.log('🗑️ تم حذف بيانات الموظفين من LocalStorage');
        } catch (e) {
            console.warn('⚠️ تعذر الحذف من LocalStorage:', e.message);
        }
    },

    updateEmployeesUI: function() {
        const fileNameEl = document.getElementById('employeesFileName');
        if (!fileNameEl) return;

        if (this.state.employeesData.length > 0) {
            const count = this.state.employeesData.length;
            const timestamp = localStorage.getItem('attendance_employees_timestamp');
            let msg = count + ' موظف محفوظين';
            if (timestamp) {
                msg += ' (آخر تحديث: ' + new Date(timestamp).toLocaleDateString('ar-YE') + ')';
            }
            fileNameEl.textContent = msg;
            fileNameEl.style.color = '#27ae60';
        } else {
            fileNameEl.textContent = 'لم يتم اختيار ملف';
            fileNameEl.style.color = '';
        }
    },

    // ───────────────────────────────────────────
    // معالجة رفع ملف الموظفين
    // ───────────────────────────────────────────
    handleEmployeesFile: async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.showAlert('جاري قراءة ملف الموظفين...', 'info');

        try {
            const result = await ExcelReader.readFile(file, this.requiredColumns.employees);

            if (!result.success) {
                this.showAlert(result.error, 'danger');
                event.target.value = '';
                return;
            }

            this.state.employeesData = result.data;
            this.saveEmployeesToStorage();
            this.updateEmployeesUI();

            this.showAlert('تم قراءة وحفظ ملف الموظفين بنجاح: ' + result.data.length + ' موظف', 'success');

            if (this.state.attendanceData.length > 0) {
                this.showAlert('تم اكتشاف ملف بصمة محمل. اضغط "معالجة البيانات" لتحديث النتائج.', 'info');
            }

        } catch (err) {
            this.showAlert('حدث خطأ غير متوقع: ' + err.message, 'danger');
            event.target.value = '';
        }
    },

    // ───────────────────────────────────────────
    // معالجة رفع ملف البصمة
    // ───────────────────────────────────────────
    handleAttendanceFile: async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileNameEl = document.getElementById('attendanceFileName');
        if (fileNameEl) fileNameEl.textContent = file.name;

        this.showAlert('جاري قراءة ملف البصمة...', 'info');

        try {
            const result = await ExcelReader.readFile(file);

            if (!result.success) {
                this.showAlert(result.error, 'danger');
                if (fileNameEl) fileNameEl.textContent = 'لم يتم اختيار ملف';
                event.target.value = '';
                return;
            }

            this.state.attendanceData = result.data;
            this.showAlert(
                'تم قراءة ملف البصمة بنجاح: ' + result.data.length + ' سجل' +
                ' (الشكل: ' + (result.layout === 'matrix' ? 'مصفوفي' : 'طولي') + ')',
                'success'
            );

            if (this.state.employeesData.length > 0) {
                this.showAlert('بيانات الموظفين جاهزة. اضغط "معالجة البيانات" لحساب النتائج.', 'info');
            } else {
                this.showAlert('يرجى رفع ملف الموظفين أولاً (أو تحميله من التخزين المحلي)', 'warning');
            }

        } catch (err) {
            this.showAlert('حدث خطأ غير متوقع: ' + err.message, 'danger');
            if (fileNameEl) fileNameEl.textContent = 'لم يتم اختيار ملف';
            event.target.value = '';
        }
    },

    // ───────────────────────────────────────────
    // معالجة جميع البيانات
    // ───────────────────────────────────────────
    processAll: function() {
        if (this.state.employeesData.length === 0) {
            this.loadEmployeesFromStorage();

            if (this.state.employeesData.length === 0) {
                this.showAlert('يرجى رفع ملف الموظفين أولاً', 'warning');
                return;
            }
        }

        if (this.state.attendanceData.length === 0) {
            this.showAlert('يرجى رفع ملف البصمة أولاً', 'warning');
            return;
        }

        Calculator.updateSettings({
            shift1In: this.state.settings.shift1In,
            shift1Out: this.state.settings.shift1Out,
            shift2In: this.state.settings.shift2In,
            shift2Out: this.state.settings.shift2Out,
            incompletePenalty: this.state.settings.incompletePenalty,
            dailyHours: 10.5
        });

        try {
            this.state.results = Calculator.processAll(
                this.state.employeesData,
                this.state.attendanceData
            );

            this.updateStatsCards();
            this.fillAttendanceTable();
            this.fillSalariesTable();

            this.showAlert('تم معالجة البيانات بنجاح!', 'success');
        } catch (err) {
            this.showAlert('حدث خطأ أثناء معالجة البيانات: ' + err.message, 'danger');
            console.error('خطأ في المعالجة:', err);
        }
    },

    // ───────────────────────────────────────────
    // تحديث بطاقات الإحصائيات
    // ───────────────────────────────────────────
    updateStatsCards: function() {
        const results = this.state.results;
        const keys = Object.keys(results);

        if (keys.length === 0) return;

        let totalAttendance = 0;
        let totalAbsence = 0;
        let totalLeaves = 0;
        let totalDeductions = 0;
        let totalSalaries = 0;

        for (const key of keys) {
            const r = results[key];
            totalAttendance += r.attendance;
            totalAbsence += r.absence;
            totalLeaves += r.leaves;
            totalDeductions += r.totalDeductions;
            totalSalaries += r.netSalary;
        }

        this.setText('statEmployees', keys.length);
        this.setText('statAttendance', totalAttendance);
        this.setText('statAbsence', totalAbsence);
        this.setText('statLeaves', totalLeaves);
        this.setText('statDeductions', this.formatCurrency(totalDeductions));
        this.setText('statSalaries', this.formatCurrency(totalSalaries));
    },

    // ───────────────────────────────────────────
    // تعبئة جدول الحضور
    // ───────────────────────────────────────────
    fillAttendanceTable: function() {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;

        const results = this.state.results;
        const keys = Object.keys(results);

        if (keys.length === 0) {
            tbody.innerHTML = this.getEmptyRow(10);
            return;
        }

        let html = '';
        let index = 1;

        for (const key of keys) {
            const r = results[key];
            html += `
                <tr>
                    <td>${index}</td>
                    <td>${this.escapeHtml(r.empId)}</td>
                    <td>${this.escapeHtml(r.name)}</td>
                    <td><span class="badge-custom badge-present">${r.attendance}</span></td>
                    <td><span class="badge-custom badge-absent">${r.absence}</span></td>
                    <td><span class="badge-custom badge-leave">${r.leaves}</span></td>
                    <td>${r.incomplete}</td>
                    <td><span class="badge-custom badge-late">${r.lateMinutes} د</span></td>
                    <td><span class="badge-custom badge-early">${r.earlyLeaveMinutes} د</span></td>
                    <td>${r.workingHours}</td>
                </tr>
            `;
            index++;
        }

        tbody.innerHTML = html;
    },

    // ───────────────────────────────────────────
    // تعبئة جدول الرواتب
    // ───────────────────────────────────────────
    fillSalariesTable: function() {
        const tbody = document.getElementById('salariesTableBody');
        if (!tbody) return;

        const results = this.state.results;
        const keys = Object.keys(results);

        if (keys.length === 0) {
            tbody.innerHTML = this.getEmptyRow(10);
            return;
        }

        let html = '';
        let index = 1;

        for (const key of keys) {
            const r = results[key];
            html += `
                <tr>
                    <td>${index}</td>
                    <td>${this.escapeHtml(r.name)}</td>
                    <td>${this.formatCurrency(r.basicSalary)}</td>
                    <td>${this.formatCurrency(r.totalSalary)}</td>
                    <td class="text-danger">${this.formatCurrency(r.absenceDeduction)}</td>
                    <td class="text-danger">${this.formatCurrency(r.lateDeduction)}</td>
                    <td class="text-danger">${this.formatCurrency(r.earlyDeduction)}</td>
                    <td class="text-danger">${this.formatCurrency(r.incompleteDeduction)}</td>
                    <td class="text-danger fw-bold">${this.formatCurrency(r.totalDeductions)}</td>
                    <td class="text-success fw-bold">${this.formatCurrency(r.netSalary)}</td>
                </tr>
            `;
            index++;
        }

        tbody.innerHTML = html;
    },

    // ───────────────────────────────────────────
    // حفظ الإعدادات
    // ───────────────────────────────────────────
    saveSettings: function() {
        const shift1In = document.getElementById('shift1In');
        const shift1Out = document.getElementById('shift1Out');
        const shift2In = document.getElementById('shift2In');
        const shift2Out = document.getElementById('shift2Out');
        const incompletePenalty = document.getElementById('incompletePenalty');

        if (!shift1In || !shift1Out || !shift2In || !shift2Out || !incompletePenalty) return;

        this.state.settings = {
            shift1In: shift1In.value,
            shift1Out: shift1Out.value,
            shift2In: shift2In.value,
            shift2Out: shift2Out.value,
            incompletePenalty: parseInt(incompletePenalty.value, 10) || 50
        };

        try {
            localStorage.setItem('attendance_settings', JSON.stringify(this.state.settings));
        } catch (e) {
            console.warn('تعذر الحفظ في LocalStorage:', e.message);
        }

        this.showAlert('تم حفظ الإعدادات بنجاح', 'success');
    },

    // ───────────────────────────────────────────
    // تحميل الإعدادات المحفوظة
    // ───────────────────────────────────────────
    loadSettings: function() {
        try {
            const saved = localStorage.getItem('attendance_settings');
            if (saved) {
                this.state.settings = JSON.parse(saved);
                const s = this.state.settings;
                if (document.getElementById('shift1In')) document.getElementById('shift1In').value = s.shift1In;
                if (document.getElementById('shift1Out')) document.getElementById('shift1Out').value = s.shift1Out;
                if (document.getElementById('shift2In')) document.getElementById('shift2In').value = s.shift2In;
                if (document.getElementById('shift2Out')) document.getElementById('shift2Out').value = s.shift2Out;
                if (document.getElementById('incompletePenalty')) document.getElementById('incompletePenalty').value = s.incompletePenalty;
            }
        } catch (e) {
            console.warn('تعذر قراءة الإعدادات من LocalStorage:', e.message);
        }
    },

    // ───────────────────────────────────────────
    // تصدير النتائج إلى Excel
    // ───────────────────────────────────────────
    exportResults: function() {
        const results = this.state.results;
        const keys = Object.keys(results);

        if (keys.length === 0) {
            this.showAlert('لا توجد نتائج للتصدير. قم بمعالجة البيانات أولاً', 'warning');
            return;
        }

        const exportData = [];
        for (const key of keys) {
            const r = results[key];
            exportData.push({
                'الرقم الوظيفي': r.empId,
                'الاسم': r.name,
                'الراتب الأساسي': r.basicSalary,
                'الراتب الشامل': r.totalSalary,
                'الحضور': r.attendance,
                'الغياب': r.absence,
                'الإجازات': r.leaves,
                'البصمات الناقصة': r.incomplete,
                'التأخير (دقيقة)': r.lateMinutes,
                'الخروج المبكر (دقيقة)': r.earlyLeaveMinutes,
                'ساعات العمل': r.workingHours,
                'خصم الغياب': r.absenceDeduction,
                'خصم التأخير': r.lateDeduction,
                'خصم الخروج المبكر': r.earlyDeduction,
                'خصم البصمة الناقصة': r.incompleteDeduction,
                'إجمالي الخصومات': r.totalDeductions,
                'صافي الراتب': r.netSalary
            });
        }

        try {
            ExcelReader.exportToExcel(exportData, 'نتائج_الحضور_والرواتب.xlsx', 'النتائج');
            this.showAlert('تم تصدير النتائج بنجاح', 'success');
        } catch (err) {
            this.showAlert('حدث خطأ أثناء التصدير: ' + err.message, 'danger');
        }
    },

    // ───────────────────────────────────────────
    // أدوات مساعدة - تنسيق العملة (الريال اليمني)
    // ───────────────────────────────────────────

    /**
     * تنسيق المبلغ كعملة (ريال يمني)
     * يدعم الأرقام الكبيرة (150,000 وما فوق)
     * @param {Number} amount - المبلغ
     * @returns {String} المبلغ منسقاً مع العملة
     */
    formatCurrency: function(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0 ر.ي';

        // تنسيق الريال اليمني بدون كسور
        const formatted = num.toLocaleString('ar-YE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        return formatted + ' ر.ي';
    },

    showAlert: function(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; left: 20px; z-index: 9999; min-width: 300px; direction: rtl;';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-close';
        closeBtn.style.cssText = 'margin-right: auto; margin-left: 0;';
        closeBtn.addEventListener('click', function() {
            if (alertDiv.parentNode) alertDiv.remove();
        });

        const msgSpan = document.createElement('span');
        msgSpan.textContent = message;

        alertDiv.appendChild(msgSpan);
        alertDiv.appendChild(closeBtn);
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) alertDiv.remove();
        }, 4000);
    },

    setText: function(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    getEmptyRow: function(colspan) {
        return `
            <tr>
                <td colspan="${colspan}">
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <p>لم يتم معالجة البيانات بعد. ارفع الملفات واضغط "معالجة البيانات"</p>
                    </div>
                </td>
            </tr>
        `;
    },

    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ───────────────────────────────────────────
// تشغيل التطبيق عند تحميل الصفحة
// ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
