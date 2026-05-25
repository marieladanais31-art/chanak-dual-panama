export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requiredFields = [
    'studentFullName', 'studentBirthDate', 'studentAge', 'studentCountry', 'studentCity', 'studentGrade', 'schoolType', 'studentEnrolled',
    'guardianFullName', 'guardianRelation', 'guardianEmail', 'guardianWhatsapp', 'guardianCountry', 'guardianCity',
    'interestRoute', 'mainGoal', 'englishLevel', 'studiedInEnglish'
  ];

  const data = req.body || {};
  const missing = requiredFields.filter((field) => !data[field]);
  const confirmations = ['confirmComplementary', 'confirmCredits', 'confirmFee', 'confirmPlan', 'confirmContact', 'confirmPrivacy'];
  const missingConfirmations = confirmations.filter((field) => data[field] !== true);

  if (missing.length || missingConfirmations.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const to = process.env.ENROLLMENT_TO_EMAIL || 'dualdiploma@chanakacademy.org';
  const from = process.env.ENROLLMENT_FROM_EMAIL || 'onboarding@resend.dev';
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Email service is not configured' });
  }

  const text = `Nueva solicitud de matrícula — Dual Diploma Panamá\n\nSECCIÓN 1: Datos del estudiante\n- Nombre completo: ${data.studentFullName || ''}\n- Fecha de nacimiento: ${data.studentBirthDate || ''}\n- Edad: ${data.studentAge || ''}\n- Nacionalidad: ${data.studentNationality || ''}\n- País de residencia: ${data.studentCountry || ''}\n- Ciudad / provincia: ${data.studentCity || ''}\n- Grado actual: ${data.studentGrade || ''}\n- Colegio actual en Panamá: ${data.studentSchool || ''}\n- Tipo de colegio: ${data.schoolType || ''}\n- ¿Continúa matriculado?: ${data.studentEnrolled || ''}\n\nSECCIÓN 2: Datos del padre, madre o tutor\n- Nombre completo: ${data.guardianFullName || ''}\n- Relación con el estudiante: ${data.guardianRelation || ''}\n- Email principal: ${data.guardianEmail || ''}\n- WhatsApp: ${data.guardianWhatsapp || ''}\n- País: ${data.guardianCountry || ''}\n- Ciudad: ${data.guardianCity || ''}\n- Mejor horario para contacto: ${data.bestContactTime || ''}\n\nSECCIÓN 3: Ruta académica de interés\n- Ruta de interés: ${data.interestRoute || ''}\n- Objetivo principal: ${data.mainGoal || ''}\n- Interés universitario fuera de Panamá: ${data.outsidePanamaInterest || ''}\n- Países de interés universitario: ${data.universityCountries || ''}\n\nSECCIÓN 4: Nivel académico e inglés\n- Nivel aproximado de inglés: ${data.englishLevel || ''}\n- ¿Ha estudiado antes en inglés?: ${data.studiedInEnglish || ''}\n- Áreas fuertes: ${data.strengthAreas || ''}\n- Áreas de apoyo: ${data.supportAreas || ''}\n- ¿Ha repetido algún grado?: ${data.repeatedGrade || ''}\n- Necesidades educativas/adaptaciones: ${data.specialNeeds || ''}\n\nSECCIÓN 5: Documentos académicos\n- Boletín/calificaciones (Drive): ${data.reportCardLink || ''}\n- Transcript/historial (Drive): ${data.transcriptLink || ''}\n- Documento de identidad/pasaporte (Drive): ${data.idDocumentLink || ''}\n- Comentarios adicionales: ${data.additionalComments || ''}\n\nSECCIÓN 6: Confirmaciones\n- Programa complementario: ${data.confirmComplementary ? 'Sí' : 'No'}\n- Reconocimiento de créditos: ${data.confirmCredits ? 'Sí' : 'No'}\n- Costo de evaluación: ${data.confirmFee ? 'Sí' : 'No'}\n- Plan personalizado: ${data.confirmPlan ? 'Sí' : 'No'}\n- Acepta contacto: ${data.confirmContact ? 'Sí' : 'No'}\n- Acepta privacidad: ${data.confirmPrivacy ? 'Sí' : 'No'}\n`;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'Nueva solicitud de matrícula — Dual Diploma Panamá',
      text
    })
  });

  if (!resendResponse.ok) {
    const err = await resendResponse.text();
    return res.status(502).json({ error: 'Email service failed', detail: err });
  }

  return res.status(200).json({ ok: true });
}
