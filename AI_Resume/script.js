let currentStep = 1;
let expCount = 0;
let eduCount = 0;
let generatedResume = '';
let generatedCover = '';

function goToStep(n) {
  if (n < currentStep) {
    document.getElementById('output-card').style.display = 'none';
    document.getElementById('output-card').classList.remove('active');
  }
  document.getElementById('step-' + currentStep).classList.remove('active');
  document.getElementById('step-btn-' + currentStep).classList.remove('active');
  currentStep = n;
  document.getElementById('step-' + currentStep).classList.add('active');
  document.getElementById('step-btn-' + currentStep).classList.add('active');
  const fills = { 1: '33.3%', 2: '66.6%', 3: '100%' };
  document.getElementById('progress').style.width = fills[n];
  document.querySelector('.container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function addExperience() {
  expCount++;
  const id = expCount;
  const html = `
  <div class="repeat-item" id="exp-${id}">
    <button class="remove-btn" onclick="removeItem('exp-${id}')">×</button>
    <div class="form-grid">
      <div class="field"><label>Job Title</label><input type="text" id="exp-title-${id}" placeholder="Software Engineer"/></div>
      <div class="field"><label>Company</label><input type="text" id="exp-company-${id}" placeholder="Infosys Ltd."/></div>
      <div class="field"><label>Start Date</label><input type="text" id="exp-start-${id}" placeholder="Jan 2021"/></div>
      <div class="field"><label>End Date</label><input type="text" id="exp-end-${id}" placeholder="Present"/></div>
      <div class="field span2"><label>Key Responsibilities & Achievements</label>
        <textarea id="exp-desc-${id}" placeholder="• Led a team of 5 engineers to build...&#10;• Increased system performance by 40%..."></textarea></div>
    </div>
  </div>`;
  document.getElementById('experience-list').insertAdjacentHTML('beforeend', html);
}

function addEducation() {
  eduCount++;
  const id = eduCount;
  const html = `
  <div class="repeat-item" id="edu-${id}">
    <button class="remove-btn" onclick="removeItem('edu-${id}')">×</button>
    <div class="form-grid triple">
      <div class="field"><label>Degree</label><input type="text" id="edu-degree-${id}" placeholder="B.Tech Computer Science"/></div>
      <div class="field"><label>Institution</label><input type="text" id="edu-school-${id}" placeholder="Anna University"/></div>
      <div class="field"><label>Year</label><input type="text" id="edu-year-${id}" placeholder="2018 – 2022"/></div>
    </div>
  </div>`;
  document.getElementById('education-list').insertAdjacentHTML('beforeend', html);
}

function removeItem(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function collectData() {
  const experiences = [];
  document.querySelectorAll('[id^="exp-title-"]').forEach(el => {
    const i = el.id.split('-')[2];
    experiences.push({
      title: el.value,
      company: document.getElementById('exp-company-' + i)?.value || '',
      start: document.getElementById('exp-start-' + i)?.value || '',
      end: document.getElementById('exp-end-' + i)?.value || '',
      desc: document.getElementById('exp-desc-' + i)?.value || ''
    });
  });

  const education = [];
  document.querySelectorAll('[id^="edu-degree-"]').forEach(el => {
    const i = el.id.split('-')[2];
    education.push({
      degree: el.value,
      school: document.getElementById('edu-school-' + i)?.value || '',
      year: document.getElementById('edu-year-' + i)?.value || ''
    });
  });

  return {
    name: document.getElementById('name').value,
    target_role: document.getElementById('target_role').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    location: document.getElementById('location').value,
    linkedin: document.getElementById('linkedin').value,
    summary: document.getElementById('summary').value,
    skills: document.getElementById('skills').value,
    languages: document.getElementById('languages').value,
    certifications: document.getElementById('certifications').value,
    projects: document.getElementById('projects').value,
    tone: document.getElementById('tone').value,
    industry: document.getElementById('industry').value,
    company_name: document.getElementById('company_name').value,
    job_desc: document.getElementById('job_desc').value,
    experiences,
    education
  };
}

function buildResumePrompt(d) {
  const expText = d.experiences.map(e =>
    `- ${e.title} at ${e.company} (${e.start} – ${e.end})\n  ${e.desc}`
  ).join('\n');

  const eduText = d.education.map(e =>
    `- ${e.degree}, ${e.school} (${e.year})`
  ).join('\n');

  return `You are a professional resume writer. Create a ${d.tone} resume for the ${d.industry} industry.

Candidate details:
Name: ${d.name}
Target Role: ${d.target_role}
Contact: ${d.email} | ${d.phone} | ${d.location} | ${d.linkedin}
Summary: ${d.summary || 'Write a compelling 3-sentence professional summary based on the experience below.'}

Work Experience:
${expText || 'No experience provided - write placeholder sections.'}

Education:
${eduText || 'Not provided'}

Skills: ${d.skills}
Languages: ${d.languages}
Certifications: ${d.certifications}
Projects/Achievements: ${d.projects}

${d.job_desc ? `Target Job Description:\n${d.job_desc}\n\nTailor the resume to match this job description closely.` : ''}

Instructions:
- Format as a clean, professional resume with clear sections: Contact, Summary, Experience, Education, Skills, Certifications (if any)
- Use strong action verbs and quantify achievements where possible
- Keep it to one page worth of content
- Use clear section headers in ALL CAPS
- Use bullet points (•) for experience items
- Make it ATS-friendly (no tables or columns, plain text)
- Tone: ${d.tone}

Output ONLY the resume text, no explanations.`;
}

function buildCoverPrompt(d) {
  const company = d.company_name || 'the company';
  const expSummary = d.experiences.slice(0, 2).map(e => `${e.title} at ${e.company}`).join(', ');

  return `Write a ${d.tone} cover letter for ${d.name} applying for the role of ${d.target_role} at ${company}.

Background:
- Industry: ${d.industry}
- Key experience: ${expSummary || 'as described in the resume'}
- Top skills: ${d.skills}
- Location: ${d.location}

${d.job_desc ? `Job Description:\n${d.job_desc}\n\nConnect the candidate's experience directly to the requirements above.` : ''}

Instructions:
- Professional, engaging, and personalized — not generic
- 3 strong paragraphs: opening hook, value proposition, closing call-to-action
- Tone: ${d.tone}
- Keep it under 300 words
- Address to "Hiring Manager" if no specific contact
- End with a confident call to action

Output ONLY the cover letter text.`;
}

async function callClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) throw new Error('API error: ' + response.status);
  const data = await response.json();
  return data.content.map(b => b.text || '').join('');
}

async function generate() {
  const d = collectData();
  if (!d.name || !d.target_role) {
    showError('Please fill in at least your name and target role (Step 1).');
    return;
  }
  hideError();

  document.getElementById('output-card').style.display = 'block';
  document.getElementById('output-card').classList.add('active');
  document.getElementById('output-card').scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('resume-area').innerHTML = '<div class="generating"><div class="spinner"></div> Crafting your resume…</div>';
  document.getElementById('cover-area').innerHTML = '<div class="generating"><div class="spinner"></div> Writing your cover letter…</div>';

  try {
    const [resume, cover] = await Promise.all([
      callClaude(buildResumePrompt(d)),
      callClaude(buildCoverPrompt(d))
    ]);
    generatedResume = resume;
    generatedCover = cover;
    document.getElementById('resume-area').innerHTML = `<div class="resume-output">${escapeHtml(resume)}</div>`;
    document.getElementById('cover-area').innerHTML = `<div class="cover-output">${escapeHtml(cover)}</div>`;
  } catch (err) {
    document.getElementById('resume-area').innerHTML = '<div style="color:#c00;padding:20px;">Failed to generate. Please try again.</div>';
    document.getElementById('cover-area').innerHTML = '';
    console.error(err);
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function switchTab(tab) {
  document.querySelectorAll('.output-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.output-content').forEach(c => c.classList.remove('active'));
  const idx = tab === 'resume' ? 0 : 1;
  document.querySelectorAll('.output-tab')[idx].classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

function copyText(type) {
  const text = type === 'resume' ? generatedResume : generatedCover;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btns = document.querySelectorAll('#tab-' + type + ' .copy-btn');
    const btn = btns[0];
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy ' + (type === 'resume' ? 'Resume' : 'Letter');
      btn.classList.remove('copied');
    }, 2000);
  });
}

function downloadText(type) {
  const text = type === 'resume' ? generatedResume : generatedCover;
  if (!text) return;
  const name = document.getElementById('name').value.replace(/\s+/g, '_') || 'candidate';
  const filename = `${name}_${type === 'resume' ? 'Resume' : 'CoverLetter'}.txt`;
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.classList.add('show');
}

function hideError() {
  document.getElementById('error-msg').classList.remove('show');
}

function regenerate() {
  generate();
}

function startOver() {
  document.getElementById('output-card').style.display = 'none';
  document.getElementById('output-card').classList.remove('active');
  goToStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Init with one experience and one education row
addExperience();
addEducation();