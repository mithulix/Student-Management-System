// ✅ Student Management - Clean Version with JSON Fallback, LocalStorage, Toasts

// 🔃 Initial variable declarations for managing state
let students = [];
let editingIndex = -1;
let currentPage = 1;
let rowsPerPage = 5;
let currentSort = { column: null, ascending: true };

// 💾 Save data to browser localStorage
function saveToLocal() {
  localStorage.setItem('students', JSON.stringify(students));
}

// 📋 Display student data in table with pagination
function renderTable(data = applyFilters(false)) {
  const tbody = document.querySelector('#studentTable tbody');
  tbody.innerHTML = '';
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginated = data.slice(start, end);
  paginated.forEach(s => {
    const addr = s.address ? `${s.address.city}, ${s.address.area}, ${s.address.zip}` : '';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.age}</td>
      <td>${s.course}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td>${addr}</td>
      <td>${s.status}</td>
      <td>
        <button onclick="editStudent(${students.indexOf(s)})">Edit</button>
        <button onclick="deleteStudent(${students.indexOf(s)})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  renderPagination(data.length);
}

// 🔢 Show page numbers for navigating through data
function renderPagination(total) {
  const totalPages = Math.ceil(total / rowsPerPage);
  const container = document.getElementById('pagination');
  container.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => { currentPage = i; renderTable(); };
    container.appendChild(btn);
  }
}

// ✏️ Load data into form for editing a student
function editStudent(index) {
  const s = students[index];
  document.getElementById('name').value = s.name;
  document.getElementById('age').value = s.age;
  document.getElementById('course').value = s.course;
  document.getElementById('email').value = s.email;
  document.getElementById('phone').value = s.phone;
  document.getElementById('city').value = s.address.city;
  document.getElementById('area').value = s.address.area;
  document.getElementById('zip').value = s.address.zip;
  document.getElementById('status').value = s.status;
  editingIndex = index;
}

// ❌ Delete student from list
function deleteStudent(index) {
  if (confirm("Delete this student?")) {
    students.splice(index, 1);
    saveToLocal();
    renderTable();
    populateFilterOptions();
    showToast("Deleted 🗑️");
  }
}

// 🧹 Clear all data from system
function resetAllData() {
  if (confirm("Delete ALL data?")) {
    students = [];
    saveToLocal();
    renderTable();
    populateFilterOptions();
    showToast("Cleared all 🧹");
  }
}

// 🔁 Reset form fields
function clearForm() {
  ['name','age','course','email','phone','city','area','zip'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('status').value = 'Active';
  editingIndex = -1;
}

// 🔍 Trigger search
function searchStudents() {
  renderTable(applyFilters(false));
}

// 🧠 Apply filters to the data list
function applyFilters(resetPage = true) {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const selectedCourse = document.getElementById('filterCourse').value;
  const selectedStatus = document.getElementById('filterStatus').value;

  let result = students.filter(s =>
    (!selectedCourse || s.course === selectedCourse) &&
    (!selectedStatus || s.status === selectedStatus) &&
    (
      s.name.toLowerCase().includes(query) ||
      s.course.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.phone.toLowerCase().includes(query)
    )
  );

  if (resetPage) currentPage = 1;
  return result;
}

// ⬇️ Populate dropdown filters for course & status
function populateFilterOptions() {
  const courses = [...new Set(students.map(s => s.course))];
  const statuses = [...new Set(students.map(s => s.status))];

  document.getElementById('filterCourse').innerHTML = `<option value="">Filter by Course</option>` +
    courses.map(c => `<option value="${c}">${c}</option>`).join('');

  document.getElementById('filterStatus').innerHTML = `<option value="">Filter by Status</option>` +
    statuses.map(s => `<option value="${s}">${s}</option>`).join('');
}

// 📁 Export data to CSV file
function exportToCSV() {
  if (students.length === 0) return alert("No data to export");
  let csv = "ID,Name,Age,Course,Email,Phone,City,Area,ZIP,Status\n";
  students.forEach(s => {
    csv += `${s.id},"${s.name}",${s.age},"${s.course}","${s.email}","${s.phone}","${s.address.city}","${s.address.area}","${s.address.zip}","${s.status}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "students.csv";
  link.click();
}

// 🔀 Sort table column
function sortTable(column) {
  currentSort.column = column;
  currentSort.ascending = !currentSort.ascending;
  students.sort((a, b) => {
    if (typeof a[column] === 'string') {
      return currentSort.ascending
        ? a[column].localeCompare(b[column])
        : b[column].localeCompare(a[column]);
    } else {
      return currentSort.ascending ? a[column] - b[column] : b[column] - a[column];
    }
  });
  saveToLocal();
  renderTable();
}

// 🔄 Change visible rows per page
function changeRowsPerPage() {
  rowsPerPage = parseInt(document.getElementById('rowsPerPageSelect').value);
  currentPage = 1;
  renderTable();
}

// 📦 Load data on page load
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem('students')) {
    students = JSON.parse(localStorage.getItem('students'));
    renderTable();
    populateFilterOptions();
  } else {
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        students = data;
        saveToLocal();
        renderTable();
        populateFilterOptions();
        showToast("Loaded demo data ✅");
      })
      .catch(() => {
        showToast("Failed to load data.json ❌");
        renderTable();
      });
  }
});
