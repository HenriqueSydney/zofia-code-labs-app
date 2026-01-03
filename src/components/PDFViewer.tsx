interface IPDFViewer {
  base64Data: string;
}
const PDFViewer = ({ base64Data }: IPDFViewer) => {
  // O prefixo necessário para o navegador entender que é um PDF
  const pdfUrl = `data:application/pdf;base64,${base64Data}#view=FitH&navpanes=0`;

  return (
    <div className="w-full h-full">
      <embed src={pdfUrl} type="application/pdf" className="w-full h-full rounded-md " />
    </div>
  );
};

export default PDFViewer;
