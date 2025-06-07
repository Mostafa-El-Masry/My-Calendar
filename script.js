const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const date = new Date();
let currentMonth = date.getMonth();
let currentYear = date.getFullYear();

const monthElement = document.querySelector('.date');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const calendarDiv = document.querySelector('.calendar');

function renderCalendar(month, year) {
    // Remove old days grid if exists
    const oldDays = document.querySelector('.days');
    if (oldDays) oldDays.remove();

    // Get first day and total days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create days grid
    const daysDiv = document.createElement('div');
    daysDiv.className = 'days';

    // Add blank days for previous month
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'day blank';
        daysDiv.appendChild(blank);
    }

    // Add days of current month
    for (let d = 1; d <= daysInMonth; d++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.textContent = d;
        // Highlight today
        if (
            d === date.getDate() &&
            month === date.getMonth() &&
            year === date.getFullYear()
        ) {
            day.classList.add('today');
        }
        daysDiv.appendChild(day);
    }

    calendarDiv.appendChild(daysDiv);
    monthElement.textContent = `${monthNames[month]} ${year}`;
}

prevBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

// Initial render
renderCalendar(currentMonth, currentYear);