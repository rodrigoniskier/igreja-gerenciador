import { Document, Packer, Paragraph, TextRun, AlignmentType, PageOrientation } from "docx";
import { saveAs } from "file-saver";

export const generateAtaDocx = (data) => {
  // Margens de 3cm (1701 DXA) conforme Art. 6º §4º [cite: 75]
  const margins = {
    top: 1701, bottom: 1701, left: 1701, right: 1701,
  };

  // 1. TÍTULO
  const titleText = `ATA Nº ${data.numero} - DA REUNIÃO DO ${data.concilio.toUpperCase()}`;

  // 2. MONTAGEM AUTOMÁTICA DO TEXTO (ROBÔ REDATOR)
  // Concatena as partes fixas com as variáveis
  const intro = `, ${data.data_extenso}, às ${data.hora_inicio}, ${data.local}. `;
  
  const presenca = `${data.presenca}, reúnem-se para deliberações dos assuntos que compõem a pauta: ${data.pauta}. `;
  
  // Texto padrão do devocional conforme [cite: 6, 235]
  const devocional = `Seguindo com os exercícios devocionais, o Rev. Presidente conduz reflexão bíblica no texto base de ${data.texto_biblico}, seguido de uma oração pelo ${data.oracao_inicio}. Encerrado o momento devocional passa-se aos assuntos pautados para reunião como segue: `;
  
  const corpo = `${data.deliberacoes}. `;
  
  // Texto padrão de encerramento conforme [cite: 13, 256, 374]
  const encerramento = `Não havendo mais nada a ser tratado, encerra-se a reunião às ${data.hora_fim}, com oração pelo ${data.oracao_fim}, na qual lavro a presente Ata que vai por mim datada e assinada.`;

  const fullText = intro + presenca + devocional + corpo + encerramento;

  // 3. RODAPÉ
  const localDate = `${data.cidade_data}.`;
  const signature = `${data.assinatura_secretario}`;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: margins,
            orientation: PageOrientation.PORTRAIT,
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: 360 }, // Espaçamento 1.5
            children: [
              new TextRun({
                text: titleText,
                bold: true,
                font: "Arial",
                size: 24, // Tamanho 12
              }),
              new TextRun({
                text: fullText, // O texto flui direto do título, conforme modelo [cite: 1]
                font: "Arial",
                size: 24,
              }),
            ],
          }),

          // Espaço para assinatura
          new Paragraph({ text: "", spacing: { before: 800 } }),

          // Data e Local
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: localDate,
                font: "Arial",
                size: 24,
              }),
            ],
          }),

          // Nome do Secretário
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: signature,
                font: "Arial",
                size: 24,
                bold: true,
              }),
            ],
          }),
          
          new Paragraph({
             alignment: AlignmentType.RIGHT,
             children: [
               new TextRun({
                 text: "Secretário do Conselho",
                 font: "Arial",
                 size: 24,
               }),
             ],
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `Ata_${data.numero}.docx`);
  });
};
