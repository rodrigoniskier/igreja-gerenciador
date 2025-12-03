import { Document, Packer, Paragraph, TextRun, AlignmentType, PageOrientation } from "docx";
import { saveAs } from "file-saver";

export const generateAtaDocx = (data) => {
  // CONFIGURAÇÃO DAS MARGENS (Conforme Art. 6º §4º: 3cm em todas as bordas) 
  // O valor 1701 TWIPs equivale a aproximadamente 3cm.
  const margins = {
    top: 1701,
    bottom: 1701,
    left: 1701,
    right: 1701,
  };

  // 1. TÍTULO (Centralizado ou Justificado, Negrito, Caixa Alta) [cite: 93]
  const titleText = `ATA Nº ${data.numero} - DA REUNIÃO DO ${data.concilio.toUpperCase()}`;

  // 2. CORPO DA ATA (Texto corrido, Parágrafo Único, Justificado) [cite: 70, 105]
  // Montamos o texto concatenando os campos para ficar igual ao modelo "ATA 017".
  const bodyText = `, aos ${data.data_extenso}, às ${data.hora_inicio}, nas dependências da ${data.local}, ${data.presenca}. O Rev. Presidente conduz reflexão bíblica e oração. Encerrado o momento devocional passa-se aos assuntos pautados para reunião como segue: ${data.pauta}. ${data.deliberacoes}. Não havendo mais nada a ser tratado, encerra-se a reunião às ${data.hora_fim}, com oração, na qual lavro a presente Ata que vai por mim datada e assinada.`;

  // 3. DATA E ASSINATURA
  const localDate = `${data.cidade_data}.`;
  const signature = `${data.assinatura_secretario}`;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: margins,
            orientation: PageOrientation.PORTRAIT, // [cite: 87]
          },
        },
        children: [
          // Título e Corpo no mesmo bloco visual para manter a continuidade se necessário
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED, // [cite: 68, 105]
            spacing: { line: 360 }, // Espaçamento entre linhas (1.5) para facilitar leitura
            children: [
              new TextRun({
                text: titleText,
                bold: true, // [cite: 93]
                font: "Arial", // 
                size: 24, // 24 half-points = 12pt 
              }),
              new TextRun({
                text: bodyText, // O texto começa logo após o título, na mesma linha, ou logo abaixo
                font: "Arial",
                size: 24, // Tamanho 12
              }),
            ],
          }),

          // Espaço para assinatura
          new Paragraph({ text: "", spacing: { before: 800 } }),

          // Data e Local (Alinhado à direita ou conforme costume local)
          new Paragraph({
            alignment: AlignmentType.RIGHT, //
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
          
          // Cargo
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

  // Gera o arquivo e força o download
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `Ata_${data.numero}.docx`);
  });
};