import { useState } from "react";
import { FiDownload, FiFileText, FiCode, FiFile } from "react-icons/fi";
import { useExport, type ExportFormat } from "../../hooks/useExport";
import styles from "./ExportButton.module.css";

interface ExportButtonProps {
  data: any;
  filename?: string;
  label?: string;
  formats?: ExportFormat[];
}

const formatIcons = {
  csv: <FiFileText />,
  json: <FiCode />,
  pdf: <FiFile />,
};

const formatLabels = {
  csv: "CSV (Excel)",
  json: "JSON",
  pdf: "PDF",
};

const ExportButton = ({
  data,
  filename = "export",
  label = "Exportar",
  formats = ["csv", "json"],
}: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { exportData } = useExport();

  const handleExport = (format: ExportFormat) => {
    exportData(data, { format, filename });
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <FiDownload />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {formats.map((format) => (
            <button
              key={format}
              className={styles.option}
              onClick={() => handleExport(format)}
            >
              {formatIcons[format]}
              <span>{formatLabels[format]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
