import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/*
 * Função: sendInviteEmail
 * Descrição: Envia um email de convite para o convidado com o código de convite e detalhes do evento.
 * Enviar (Body JSON): {
 * "to": "email do convidado",
 * "guestName": "Nome do convidado",
 * "eventTitle": "Título do evento",
 * "inviteCode": "Código do convite",
 * "eventDate": "Data do evento",
 * "eventLocation": "Local do evento"
 * }
 * Recebe: Objeto com sucesso ou erro.
 */
export async function sendInviteEmail(
  to: string,
  guestName: string,
  eventTitle: string,
  inviteCode: string,
  eventDate: string,
  eventLocation: string
) {
  try {
    const inviteUrl = `${process.env.APP_URL}/guest/${inviteCode}`;

    const { data, error } = await resend.emails.send({
      from: "Invito <onboarding@resend.dev>",
      to: [to],
      subject: `Convite: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1c1b1f;
              background-color: #f5f5f5;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #6750A4 0%, #7C68BD 100%);
              color: white; 
              padding: 40px 32px;
              text-align: center;
            }
            .header h1 { 
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
            }
            .content { 
              padding: 32px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 16px;
              color: #1c1b1f;
            }
            .message {
              font-size: 16px;
              color: #49454f;
              margin-bottom: 24px;
            }
            .event-card { 
              background: #f5f3ff;
              padding: 24px;
              border-radius: 12px;
              margin: 24px 0;
              border-left: 4px solid #6750A4;
            }
            .event-title {
              font-size: 22px;
              font-weight: 700;
              color: #1c1b1f;
              margin-bottom: 16px;
            }
            .event-detail {
              display: flex;
              align-items: flex-start;
              margin-bottom: 12px;
              font-size: 15px;
              color: #49454f;
            }
            .event-detail:last-child {
              margin-bottom: 0;
            }
            .icon {
              width: 20px;
              margin-right: 12px;
              flex-shrink: 0;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button { 
              display: inline-block;
              background: #6750A4;
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 100px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 2px 8px rgba(103, 80, 164, 0.3);
              transition: all 0.2s;
            }
            .button:hover {
              background: #7C68BD;
              box-shadow: 0 4px 12px rgba(103, 80, 164, 0.4);
            }
            .invite-code {
              background: #fff;
              border: 2px dashed #6750A4;
              padding: 16px;
              border-radius: 8px;
              text-align: center;
              margin: 24px 0;
            }
            .code-label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #6750A4;
              margin-bottom: 4px;
              font-weight: 600;
            }
            .code-value {
              font-size: 24px;
              font-weight: 700;
              color: #6750A4;
              letter-spacing: 2px;
              font-family: 'Courier New', monospace;
            }
            .footer { 
              text-align: center;
              padding: 24px 32px;
              background: #f5f5f5;
              color: #79747e;
              font-size: 13px;
            }
            .divider {
              height: 1px;
              background: #e7e0ec;
              margin: 24px 0;
            }
            @media (max-width: 600px) {
              body { padding: 8px; }
              .content { padding: 24px 20px; }
              .header { padding: 32px 20px; }
              .header h1 { font-size: 24px; }
              .event-card { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Você foi convidado!</h1>
              <p>Confirme sua presença agora</p>
            </div>
            
            <div class="content">
              <p class="greeting">Olá <strong>${guestName}</strong>,</p>
              <p class="message">Temos o prazer de convidá-lo(a) para o seguinte evento:</p>
              
              <div class="event-card">
                <div class="event-title">${eventTitle}</div>
                <div class="event-detail">
                  <span class="icon">📍</span>
                  <span><strong>Local:</strong> ${eventLocation}</span>
                </div>
                <div class="event-detail">
                  <span class="icon">📅</span>
                  <span><strong>Data e Hora:</strong> ${eventDate}</span>
                </div>
              </div>

              <div class="invite-code">
                <div class="code-label">Seu código de convite</div>
                <div class="code-value">${inviteCode}</div>
              </div>

              <div class="button-container">
                <a href="${inviteUrl}" class="button">Confirmar Presença</a>
              </div>

              <div class="divider"></div>

              <p style="font-size: 14px; color: #79747e; text-align: center;">
                Ou acesse diretamente:<br>
                <a href="${inviteUrl}" style="color: #6750A4; word-break: break-all;">${inviteUrl}</a>
              </p>
            </div>

            <div class="footer">
              <p>Este é um convite gerado automaticamente pelo <strong>Invito</strong></p>
              <p style="margin-top: 8px;">Aguardamos sua confirmação! ✨</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      return { success: false, error };
    }

    console.log("data", data);

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}

/*
 * Função: sendRSVPConfirmationEmail
 * Descrição: Envia um email de confirmação de RSVP para o convidado com os detalhes do evento.
 * Enviar (Body JSON): {
 *  "to": "email do convidado",
 *  "guestName": "Nome do convidado",
 *  "eventTitle": "Título do evento",
 *  "status": "Status do RSVP (YES, NO, MAYBE)",
 *  "eventDate": "Data do evento",
 *  "eventLocation": "Local do evento"
 * }
 * Recebe: Objeto com sucesso ou erro.
 */
export async function sendRSVPConfirmationEmail(
  to: string,
  guestName: string,
  eventTitle: string,
  status: string,
  eventDate: string,
  eventLocation: string
) {
  const statusText =
    {
      YES: "confirmou presença",
      NO: "não poderá comparecer",
      MAYBE: "respondeu talvez",
      PENDING: "está pendente",
    }[status] || "atualizou sua resposta";

  try {
    const { data, error } = await resend.emails.send({
      from: "Invito <onboarding@resend.dev>",
      to: [to],
      subject: `Confirmação: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1c1b1f;
              background-color: #f5f5f5;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #6750A4 0%, #7C68BD 100%);
              color: white; 
              padding: 40px 32px;
              text-align: center;
            }
            .header h1 { 
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .content { 
              padding: 32px;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 100px;
              font-weight: 600;
              font-size: 14px;
              margin: 16px 0;
              ${
                status === "YES"
                  ? "background: #e8f5e9; color: #2e7d32;"
                  : status === "NO"
                  ? "background: #ffebee; color: #c62828;"
                  : status === "MAYBE"
                  ? "background: #fff3e0; color: #ef6c00;"
                  : "background: #e3f2fd; color: #1565c0;"
              }
            }
            .event-card { 
              background: #f5f3ff;
              padding: 24px;
              border-radius: 12px;
              margin: 24px 0;
              border-left: 4px solid #6750A4;
            }
            .event-title {
              font-size: 22px;
              font-weight: 700;
              color: #1c1b1f;
              margin-bottom: 16px;
            }
            .event-detail {
              display: flex;
              align-items: flex-start;
              margin-bottom: 12px;
              font-size: 15px;
              color: #49454f;
            }
            .event-detail:last-child {
              margin-bottom: 0;
            }
            .icon {
              width: 20px;
              margin-right: 12px;
              flex-shrink: 0;
            }
            .footer { 
              text-align: center;
              padding: 24px 32px;
              background: #f5f5f5;
              color: #79747e;
              font-size: 13px;
            }
            .success-message {
              background: #e8f5e9;
              border-left: 4px solid #2e7d32;
              padding: 16px;
              border-radius: 8px;
              margin: 24px 0;
              color: #1b5e20;
            }
            @media (max-width: 600px) {
              body { padding: 8px; }
              .content { padding: 24px 20px; }
              .header { padding: 32px 20px; }
              .header h1 { font-size: 24px; }
              .event-card { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${
                status === "YES" ? "✓" : status === "NO" ? "✗" : "?"
              } RSVP Recebido</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 16px;">Olá <strong>${guestName}</strong>,</p>
              
              <p style="font-size: 16px; color: #49454f; margin-bottom: 16px;">
                Obrigado por responder! Você <span class="status-badge">${statusText}</span>
              </p>
              
              <div class="event-card">
                <div class="event-title">${eventTitle}</div>
                <div class="event-detail">
                  <span class="icon">📍</span>
                  <span><strong>Local:</strong> ${eventLocation}</span>
                </div>
                <div class="event-detail">
                  <span class="icon">📅</span>
                  <span><strong>Data e Hora:</strong> ${eventDate}</span>
                </div>
              </div>

              ${
                status === "YES"
                  ? `
              <div class="success-message">
                <strong>🎉 Presença confirmada!</strong><br>
                Estamos ansiosos para vê-lo(a) no evento!
              </div>
              `
                  : ""
              }

              <p style="font-size: 14px; color: #79747e; margin-top: 24px;">
                Se precisar alterar sua resposta, você pode acessar o convite novamente usando o link que recebeu.
              </p>
            </div>

            <div class="footer">
              <p>Este é um email de confirmação gerado automaticamente pelo <strong>Invito</strong></p>
              <p style="margin-top: 8px;">Até breve! ✨</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}

/*
 * Função: sendInviteCancelledEmail
 * Descrição: Envia um email informando o convidado que o convite foi cancelado.
 * Enviar (Body JSON): {
 *  "to": "email do convidado",
 *  "guestName": "Nome do convidado",
 *  "eventTitle": "Título do evento",
 *  "eventDate": "Data do evento",
 *  "eventLocation": "Local do evento"
 * }
 * Recebe: Objeto com sucesso ou erro.
 */
export async function sendInviteCancelledEmail(
  to: string,
  guestName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Invito <onboarding@resend.dev>",
      to: [to],
      subject: `Convite cancelado: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1c1b1f;
              background-color: #f5f5f5;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #79747e 0%, #938F99 100%);
              color: white; 
              padding: 40px 32px;
              text-align: center;
            }
            .header h1 { 
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
            }
            .content { 
              padding: 32px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 16px;
              color: #1c1b1f;
            }
            .message {
              font-size: 16px;
              color: #49454f;
              margin-bottom: 24px;
            }
            .event-card { 
              background: #fef7ff;
              padding: 24px;
              border-radius: 12px;
              margin: 24px 0;
              border-left: 4px solid #79747e;
            }
            .event-title {
              font-size: 22px;
              font-weight: 700;
              color: #1c1b1f;
              margin-bottom: 16px;
            }
            .event-detail {
              display: flex;
              align-items: flex-start;
              margin-bottom: 12px;
              font-size: 15px;
              color: #49454f;
            }
            .event-detail:last-child {
              margin-bottom: 0;
            }
            .icon {
              width: 20px;
              margin-right: 12px;
              flex-shrink: 0;
            }
            .notice-box {
              background: #fff4e6;
              border-left: 4px solid #ef6c00;
              padding: 16px;
              border-radius: 8px;
              margin: 24px 0;
              color: #e65100;
            }
            .footer { 
              text-align: center;
              padding: 24px 32px;
              background: #f5f5f5;
              color: #79747e;
              font-size: 13px;
            }
            @media (max-width: 600px) {
              body { padding: 8px; }
              .content { padding: 24px 20px; }
              .header { padding: 32px 20px; }
              .header h1 { font-size: 24px; }
              .event-card { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ℹ️ Convite Cancelado</h1>
              <p>Informação sobre alteração no evento</p>
            </div>
            
            <div class="content">
              <p class="greeting">Olá <strong>${guestName}</strong>,</p>
              <p class="message">
                Informamos que o seu convite para o seguinte evento foi cancelado pelo organizador:
              </p>
              
              <div class="event-card">
                <div class="event-title">${eventTitle}</div>
                <div class="event-detail">
                  <span class="icon">📍</span>
                  <span><strong>Local:</strong> ${eventLocation}</span>
                </div>
                <div class="event-detail">
                  <span class="icon">📅</span>
                  <span><strong>Data e Hora:</strong> ${eventDate}</span>
                </div>
              </div>

              <div class="notice-box">
                <strong>ℹ️ O que isso significa?</strong><br>
                O seu convite foi removido da lista de convidados. Se você acredita que isso foi um erro, entre em contato com o organizador do evento.
              </div>

              <p style="font-size: 14px; color: #79747e; margin-top: 24px;">
                Lamentamos qualquer inconveniente. Se tiver alguma dúvida, por favor contacte o organizador do evento.
              </p>
            </div>

            <div class="footer">
              <p>Este é um email gerado automaticamente pelo <strong>Invito</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}
