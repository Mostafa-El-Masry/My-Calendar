const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const startHour = 9;
const endHour = 23;
const colors = ['color-blue', 'color-green', 'color-purple', 'color-pink'];
let currentColorIndex = 0;
let eventCount = 0;
let currentWeekStart = new Date(); // Start from today

// Set to the start of the week (Sunday)
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

// Get the calendar element
const calendar = document.getElementById('calendar');

// Load events from local storage
function loadEvents() {
  const savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
  savedEvents.forEach(event => {
    addEventToSlot(event.slotId, event.text, event.color, event.id);
  });
}

// Add event to slot
function addEventToSlot(slotId, text, color, id) {
  const slot = document.getElementById(slotId);
  const eventEl = document.createElement('div');
  eventEl.className = `event ${color}`;
  eventEl.contentEditable = true;
  eventEl.innerText = text;
  eventEl.id = id;
  eventEl.setAttribute('draggable', true);
  eventEl.addEventListener('dragstart', drag);
  slot.appendChild(eventEl);
}

// Render calendar for the current week
function renderCalendar() {
  calendar.innerHTML = `<div class="time-cell"></div>`;
  for (let d = 0; d < 7; d++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + d);
    const label = `${days[date.getUTCDay()]}<br>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    calendar.innerHTML += `<div class="day-cell day-header">${label}</div>`;
  }

  // Time + Slots
  for (let hour = startHour; hour < endHour; hour += 2) {
    const label = `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
    calendar.innerHTML += `<div class="time-cell">${label}</div>`;
    for (let d = 0; d < 7; d++) {
      const slotId = `slot-${hour}-${d}`;
      calendar.innerHTML += `<div class="slot" id="${slotId}" ondrop="drop(event)" ondragover="allowDrop(event)" onclick="addEvent('${slotId}')"></div>`;
    }
  }

  loadEvents(); // Load events for the current week
}

// Event Handlers
window.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
});

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const eventEl = document.getElementById(data);
  if (ev.target.classList.contains('slot')) {
    ev.target.appendChild(eventEl);
    saveEvents(); // Save events after dropping
  }
}

function saveEvents() {
  const events = [];
  document.querySelectorAll('.event').forEach(el => {
    const slotId = el.parentElement.id;
    events.push({
      slotId: slotId,
      text: el.innerText,
      color: el.className.split(' ').slice(1).join(' '),
      id: el.id
    });
  });
  localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function addEvent(slotId) {
  const eventText = prompt("Enter event:");
  if (!eventText) return;

  const color = colors[currentColorIndex % colors.length];
  currentColorIndex++;

  const id = `event-${eventCount++}`;
  addEventToSlot(slotId, eventText, color, id);
  saveEvents(); // Save events after adding
}

// Navigation functions
function nextWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderCalendar();
}

function previousWeek() {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderCalendar();
}