const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const startHour = 9;
const endHour = 23;
let eventCount = 0;
let currentWeekStart = new Date(); // Start from today

// Set to the start of the week (Saturday)
const dayOfWeek = currentWeekStart.getDay();
const daysSinceSaturday = (dayOfWeek + 1) % 7;
currentWeekStart.setDate(currentWeekStart.getDate() - daysSinceSaturday);

// Get the calendar element
const calendar = document.getElementById('calendar');

// Load events from local storage
function loadEvents() {
  const savedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
  // Get all dates for the current week
  const weekDates = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + d);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  savedEvents.forEach(event => {
    if (weekDates.includes(event.date)) {
      addEventToSlot(event.slotId, event.text, event.color, event.id, event.date, event.completed);
    }
  });
}

// Generate a pastel color for better readability
function getRandomColor() {
  // Random hue (0-359), random saturation (50-90%), random lightness (60-85%)
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 41) + 50; // 50-90%
  const lightness = Math.floor(Math.random() * 26) + 60;  // 60-85%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getContrastTextColor(bgColor) {
  // Convert HSL to RGB
  const hsl = bgColor.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
  if (!hsl) return '#000';
  let [h, s, l] = [parseInt(hsl[1]), parseFloat(hsl[2]), parseFloat(hsl[3])];
  s /= 100;
  l /= 100;

  // HSL to RGB conversion
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#222' : '#fff';
}

// Add event to slot
function addEventToSlot(slotId, text, color, id, date, completed) {
  const slot = document.getElementById(slotId);
  const eventEl = document.createElement('div');
  eventEl.className = `event`;
  eventEl.id = id;
  eventEl.setAttribute('draggable', true);
  eventEl.addEventListener('dragstart', drag);

  // Task text
  const textDiv = document.createElement('div');
  textDiv.className = 'event-text';
  textDiv.contentEditable = true;
  textDiv.innerText = text;
  if (completed) {
    textDiv.style.textDecoration = 'line-through';
  }
  eventEl.appendChild(textDiv);

  // Button wrapper (toggle and delete in separate divs)
  const btnWrapper = document.createElement('div');
  btnWrapper.className = 'event-btn-wrapper';

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = '<i class="fa-solid fa-toggle-on"></i>';
  toggleBtn.className = 'toggle-btn';
  toggleBtn.onclick = function(e) {
    e.stopPropagation();
    textDiv.style.textDecoration = textDiv.style.textDecoration === 'line-through' ? 'none' : 'line-through';
    saveEvents();
  };
  btnWrapper.appendChild(toggleBtn);

  eventEl.appendChild(btnWrapper);

  // Delete button in a new div
  const deleteDiv = document.createElement('div');
  deleteDiv.className = 'delete-btn-wrapper';
  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = function(e) {
    e.stopPropagation();
    deleteEvent(id);
  };
  deleteDiv.appendChild(deleteBtn);
  eventEl.appendChild(deleteDiv);

  // Set background and text color
  eventEl.style.backgroundColor = color;
  eventEl.style.color = getContrastTextColor(color);

  slot.appendChild(eventEl);
}

// Delete event by id
function deleteEvent(eventId) {
  const eventEl = document.getElementById(eventId);
  if (eventEl) {
    eventEl.parentElement.removeChild(eventEl);
    saveEvents();
  }
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

// Update saveEvents to store date
function saveEvents() {
  const allEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];

  // Get all dates for the current week
  const weekDates = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + d);
    weekDates.push(date.toISOString().split('T')[0]);
  }

  // Remove events for the current week from allEvents
  const filteredEvents = allEvents.filter(event => !weekDates.includes(event.date));

  // Get current week events from DOM
  const currentWeekEvents = [];
  document.querySelectorAll('.event').forEach(el => {
    const slotId = el.parentElement.id;
    const match = slotId.match(/slot-(\d+)-(\d+)/);
    if (!match) return;
    const dayIndex = parseInt(match[2]);
    const eventDate = new Date(currentWeekStart);
    eventDate.setDate(currentWeekStart.getDate() + dayIndex);
    const dateStr = eventDate.toISOString().split('T')[0];

    // Get the text from the .event-text div
    const textDiv = el.querySelector('.event-text');
    const text = textDiv ? textDiv.innerText : '';
    const completed = textDiv && textDiv.style.textDecoration === 'line-through';

    currentWeekEvents.push({
      slotId: slotId,
      text: text,
      color: el.style.backgroundColor,
      id: el.id,
      date: dateStr,
      completed: completed // <-- Save completed state
    });
  });

  localStorage.setItem('calendarEvents', JSON.stringify([...filteredEvents, ...currentWeekEvents]));
}

function addEvent(slotId) {
  const eventText = prompt("Enter event:");
  if (!eventText) return;

  // Use your dynamic color generator instead
  const color = getRandomColor();
  const id = `event-${eventCount++}`;

  // Get day index from slotId
  const match = slotId.match(/slot-(\d+)-(\d+)/);
  if (!match) return;
  const dayIndex = parseInt(match[2]);
  const eventDate = new Date(currentWeekStart);
  eventDate.setDate(currentWeekStart.getDate() + dayIndex);
  const dateStr = eventDate.toISOString().split('T')[0];

  addEventToSlot(slotId, eventText, color, id, dateStr);
  saveEvents();
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

/* CSS Styles */
const style = document.createElement('style');
style.innerHTML = `
  #calendar {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-auto-rows: 100px;
    gap: 1px;
    background-color: #ccc;
  }

  .day-cell {
    background-color: #f0f0f0;
    text-align: center;
    font-weight: bold;
    padding: 4px 0;
  }

  .time-cell {
    background-color: #e0e0e0;
    text-align: center;
    font-weight: bold;
    padding: 4px 0;
  }

  .slot {
    background-color: #fff;
    border: 1px dashed #bbb;
    position: relative;
  }

  .event {
    position: absolute;
    left: 0;
    right: 0;
    padding: 4px;
    margin: 2px 0;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .event-text {
    flex-grow: 1;
    cursor: text;
  }

  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #888;
    font-size: 16px;
    padding: 0 4px;
  }

  .event-btn-wrapper {
    display: flex;
    gap: 6px;
    margin-top: 4px;
    justify-content: flex-end;
  }

  .toggle-btn,
  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #888;
    font-size: 16px;
    padding: 0 4px;
  }
`;
document.head.appendChild(style);
