import { useToast } from "../context/ToastContext";

export type ExportFormat = "csv" | "json" | "pdf";

interface ExportOptions {
  filename?: string;
  format: ExportFormat;
}

export function useExport() {
  const { success, error } = useToast();

  /**
   * Exportar datos a CSV
   */
  const exportToCSV = (data: any[], filename: string = "export") => {
    try {
      if (!data || data.length === 0) {
        error("No hay datos para exportar");
        return;
      }

      // Obtener headers de las claves del primer objeto
      const headers = Object.keys(data[0]);
      
      // Crear líneas CSV
      const csvRows = [
        headers.join(","), // Header row
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              // Escapar comillas y envolver en comillas si contiene coma
              const escaped = String(value).replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `${filename}.csv`);
      success(`Datos exportados a ${filename}.csv`);
    } catch (err) {
      error("Error al exportar a CSV");
      console.error(err);
    }
  };

  /**
   * Exportar datos a JSON
   */
  const exportToJSON = (data: any, filename: string = "export") => {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      downloadBlob(blob, `${filename}.json`);
      success(`Datos exportados a ${filename}.json`);
    } catch (err) {
      error("Error al exportar a JSON");
      console.error(err);
    }
  };

  /**
   * Exportar datos a PDF (placeholder - requiere librería como jsPDF)
   */
  const exportToPDF = (data: any, filename: string = "export") => {
    error("Exportación a PDF próximamente. Usa CSV o JSON por ahora.");
    // TODO: Implementar con jsPDF o similar
    // import jsPDF from 'jspdf';
    // const doc = new jsPDF();
    // doc.text('Hello world!', 10, 10);
    // doc.save(`${filename}.pdf`);
  };

  /**
   * Función principal de exportación
   */
  const exportData = (
    data: any,
    options: ExportOptions = { format: "csv", filename: "export" }
  ) => {
    const { format, filename = "export" } = options;

    switch (format) {
      case "csv":
        exportToCSV(Array.isArray(data) ? data : [data], filename);
        break;
      case "json":
        exportToJSON(data, filename);
        break;
      case "pdf":
        exportToPDF(data, filename);
        break;
      default:
        error("Formato de exportación no soportado");
    }
  };

  /**
   * Descargar blob como archivo
   */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return {
    exportData,
    exportToCSV,
    exportToJSON,
    exportToPDF,
  };
}
