// ======================
// Lite AI OS
// ======================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// State (saved in localStorage)
let state = {
  jobs: [],
  tasks: [],
  mpesa: [],
  notes: "",
  aiHistory: []
};

function load() {
  try {
    const raw = localStorage.getItem("lite-ai-os");
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch (e) {}
}

function save() {
  localStorage.setItem("lite-ai-os", JSON.stringify(state));
  updateDashboard();
}

// ---------- Navigation ----------
$$(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".view").forEach(v => v.classList.remove("active"));
    $(`#view-${btn.dataset.view}`).classList.add("active");
  });
});

// ---------- Clock ----------
function updateClock() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleString("en-TZ", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}
setInterval(updateClock, 1000);
updateClock();

// ---------- Dashboard ----------
function updateDashboard() {
  $("#jobCount").textContent = state.jobs.length;
  $("#taskCount").textContent = state.tasks.filter(t => !t.done).length;
  $("#mpesaTotal").textContent = state.mpesa.length;
}

// ---------- Jobs ----------
function renderJobs() {
  const tbody = $("#jobTable");
  tbody.innerHTML = "";
  state.jobs.forEach((job, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(job.title)}</td>
      <td>${escapeHtml(job.company)}</td>
      <td><span class="status-badge ${job.status}">${job.status}</span></td>
      <td>
        <button class="btn small" onclick="editJob(${i})">Edit</button>
        <button class="btn small danger" onclick="deleteJob(${i})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

$("#addJobBtn").addEventListener("click", () => {
  $("#jobForm").classList.remove("hidden");
  $("#jobTitle").value = "";
  $("#jobCompany").value = "";
  $("#jobLink").value = "";
  $("#jobStatus").value = "Wishlist";
  $("#jobNotes").value = "";
  $("#jobForm").dataset.edit = "";
});

$("#cancelJob").addEventListener("click", () => {
  $("#jobForm").classList.add("hidden");
});

$("#saveJob").addEventListener("click", () => {
  const title = $("#jobTitle").value.trim();
  const company = $("#jobCompany").value.trim();
  if (!title) return alert("Title is required");

  const job = {
    title,
    company,
    link: $("#jobLink").value.trim(),
    status: $("#jobStatus").value,
    notes: $("#jobNotes").value.trim(),
    created: new Date().toISOString()
  };

  const editIdx = $("#jobForm").dataset.edit;
  if (editIdx !== "") {
    state.jobs[parseInt(editIdx)] = job;
  } else {
    state.jobs.unshift(job);
  }

  save();
  renderJobs();
  $("#jobForm").classList.add("hidden");
});

window.editJob = (i) => {
  const job = state.jobs[i];
  $("#jobTitle").value = job.title;
  $("#jobCompany").value = job.company;
  $("#jobLink").value = job.link || "";
  $("#jobStatus").value = job.status;
  $("#jobNotes").value = job.notes || "";
  $("#jobForm").dataset.edit = i;
  $("#jobForm").classList.remove("hidden");
};

window.deleteJob = (i) => {
  if (confirm("Delete this job?")) {
    state.jobs.splice(i, 1);
    save();
    renderJobs();
  }
};

// ---------- M-Pesa Log (record only) ----------
function renderMpesa() {
  const tbody = $("#mpesaTable");
  tbody.innerHTML = "";
  state.mpesa.forEach((entry, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td>${escapeHtml(entry.to)}</td>
      <td>${Number(entry.amount).toLocaleString()} TZS</td>
      <td>${escapeHtml(entry.reason || "")}</td>
      <td><button class="btn small danger" onclick="deleteMpesa(${i})">×</button></td>
    `;
    tbody.appendChild(tr);
  });
}

$("#addMpesaBtn").addEventListener("click", () => {
  $("#mpesaForm").classList.remove("hidden");
  $("#mpesaTo").value = "";
  $("#mpesaAmount").value = "";
  $("#mpesaReason").value = "";
});

$("#cancelMpesa").addEventListener("click", () => {
  $("#mpesaForm").classList.add("hidden");
});

$("#saveMpesa").addEventListener("click", () => {
  const to = $("#mpesaTo").value.trim();
  const amount = parseFloat($("#mpesaAmount").value);
  if (!to || isNaN(amount)) return alert("To and Amount are required");

  state.mpesa.unshift({
    to,
    amount,
    reason: $("#mpesaReason").value.trim(),
    date: new Date().toISOString()
  });

  save();
  renderMpesa();
  $("#mpesaForm").classList.add("hidden");
});

window.deleteMpesa = (i) => {
  state.mpesa.splice(i, 1);
  save();
  renderMpesa();
};

// ---------- Tasks ----------
function renderTasks() {
  const list = $("#taskList");
  list.innerHTML = "";
  state.tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");
    li.innerHTML = `
      <input type="checkbox" ${task.done ? "checked" : ""} onchange="toggleTask(${i})" />
      <span>${escapeHtml(task.text)}</span>
      <button class="btn small danger" onclick="deleteTask(${i})">×</button>
    `;
    list.appendChild(li);
  });
}

$("#addTaskBtn").addEventListener("click", addTask);
$("#taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

function addTask() {
  const text = $("#taskInput").value.trim();
  if (!text) return;
  state.tasks.unshift({ text, done: false });
  $("#taskInput").value = "";
  save();
  renderTasks();
}

window.toggleTask = (i) => {
  state.tasks[i].done = !state.tasks[i].done;
  save();
  renderTasks();
};

window.deleteTask = (i) => {
  state.tasks.splice(i, 1);
  save();
  renderTasks();
};

// ---------- Notes ----------
$("#notesArea").value = "";
$("#saveNotesBtn").addEventListener("click", () => {
  state.notes = $("#notesArea").value;
  save();
  $("#statusPill").textContent = "Notes saved";
  setTimeout(() => $("#statusPill").textContent = "Ready", 1500);
});

// ---------- AI Assistant ----------
const aiMessages = $("#aiMessages");

function addAiMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

$("#aiSend").addEventListener("click", sendAi);
$("#aiInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendAi();
  }
});

async function sendAi() {
  const text = $("#aiInput").value.trim();
  if (!text) return;

  $("#aiInput").value = "";
  addAiMessage("user", text);
  state.aiHistory.push({ role: "user", content: text });

  const thinking = document.createElement("div");
  thinking.className = "msg assistant";
  thinking.textContent = "Thinking...";
  aiMessages.appendChild(thinking);

  try {
    let reply = "";

    if (typeof puter !== "undefined" && puter.ai) {
      const response = await puter.ai.chat(state.aiHistory.slice(-8), {
        model: "claude-sonnet-4"
      });
      if (typeof response === "string") reply = response;
      else if (response?.message?.content) reply = response.message.content;
      else if (response?.text) reply = response.text;
      else reply = JSON.stringify(response);
    } else {
      // Offline fallback
      reply = localAiReply(text);
    }

    thinking.remove();
    addAiMessage("assistant", reply);
    state.aiHistory.push({ role: "assistant", content: reply });
    save();
  } catch (err) {
    thinking.textContent = "Error: " + err.message + "\n\n(Using offline helper)";
    const fallback = localAiReply(text);
    addAiMessage("assistant", fallback);
  }
}

function localAiReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes("cover letter")) {
    return "Here's a short cover letter template:\n\nDear Hiring Manager,\n\nI am writing to express my interest in the [Job Title] position at [Company]. With my background in [Your Skill/Experience], I am confident I can contribute to your team.\n\nI would welcome the opportunity to discuss how my skills match your needs.\n\nSincerely,\n[Your Name]\n\n→ Replace the brackets with your details.";
  }
  if (lower.includes("interview")) {
    return "Common interview tip:\n\nUse the STAR method (Situation, Task, Action, Result) when answering behavioural questions. Keep answers under 2 minutes and focus on results.";
  }
  return "I'm in offline helper mode. Ask me for a cover letter template, interview tips, or to rewrite a short message. For stronger answers, make sure you have internet so Puter.js can load.";
}

// ---------- Helpers ----------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Init ----------
load();
$("#notesArea").value = state.notes || "";
renderJobs();
renderTasks();
renderMpesa();
updateDashboard();

// Restore AI history visually
state.aiHistory.forEach(m => addAiMessage(m.role, m.content));
