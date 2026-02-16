import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Card from "../../components/Card";
import Button from "../../components/Button";
import styles from "./Configuracion.module.css";

const Configuracion = () => {
  const { mode, colors, setMode, setCustomColors, resetToDefaults } = useTheme();
  const [customColorValues, setCustomColorValues] = useState(colors);

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setCustomColorValues((prev) => ({ ...prev, [key]: value }));
  };

  const applyCustomColors = () => {
    setMode("custom");
    setCustomColors(customColorValues);
  };

  const handleModeChange = (newMode: "dark" | "light" | "custom") => {
    setMode(newMode);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configuración</h1>
      <p className={styles.subtitle}>
        Personaliza la apariencia y el estilo de la aplicación
      </p>

      <div className={styles.grid}>
        {/* Selector de tema */}
        <Card title="Modo de Tema" className={styles.card}>
          <div className={styles.themeSelector}>
            <div className={styles.themeOption}>
              <input
                type="radio"
                id="dark-mode"
                name="theme"
                value="dark"
                checked={mode === "dark"}
                onChange={() => handleModeChange("dark")}
                className={styles.radio}
              />
              <label htmlFor="dark-mode" className={styles.label}>
                <div className={styles.themePreview} data-theme="dark">
                  <div className={styles.previewBar}></div>
                  <div className={styles.previewContent}>
                    <div className={styles.previewBox}></div>
                    <div className={styles.previewBox}></div>
                  </div>
                </div>
                <span>Oscuro</span>
              </label>
            </div>

            <div className={styles.themeOption}>
              <input
                type="radio"
                id="light-mode"
                name="theme"
                value="light"
                checked={mode === "light"}
                onChange={() => handleModeChange("light")}
                className={styles.radio}
              />
              <label htmlFor="light-mode" className={styles.label}>
                <div className={styles.themePreview} data-theme="light">
                  <div className={styles.previewBar}></div>
                  <div className={styles.previewContent}>
                    <div className={styles.previewBox}></div>
                    <div className={styles.previewBox}></div>
                  </div>
                </div>
                <span>Claro</span>
              </label>
            </div>

            <div className={styles.themeOption}>
              <input
                type="radio"
                id="custom-mode"
                name="theme"
                value="custom"
                checked={mode === "custom"}
                onChange={() => handleModeChange("custom")}
                className={styles.radio}
              />
              <label htmlFor="custom-mode" className={styles.label}>
                <div className={styles.themePreview} data-theme="custom">
                  <div className={styles.previewBar}></div>
                  <div className={styles.previewContent}>
                    <div className={styles.previewBox}></div>
                    <div className={styles.previewBox}></div>
                  </div>
                </div>
                <span>Personalizado</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Colores personalizados */}
        {mode === "custom" && (
          <Card title="Colores Personalizados" className={styles.card}>
            <div className={styles.colorGrid}>
              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Fondo Principal
                  <input
                    type="color"
                    value={customColorValues.bg}
                    onChange={(e) => handleColorChange("bg", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.bg}
                  onChange={(e) => handleColorChange("bg", e.target.value)}
                  className={styles.textInput}
                  placeholder="#0c1117"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Superficie
                  <input
                    type="color"
                    value={customColorValues.surface}
                    onChange={(e) => handleColorChange("surface", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.surface}
                  onChange={(e) => handleColorChange("surface", e.target.value)}
                  className={styles.textInput}
                  placeholder="#141b24"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Superficie 2
                  <input
                    type="color"
                    value={customColorValues.surface2}
                    onChange={(e) => handleColorChange("surface2", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.surface2}
                  onChange={(e) => handleColorChange("surface2", e.target.value)}
                  className={styles.textInput}
                  placeholder="#1a2230"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Bordes
                  <input
                    type="color"
                    value={customColorValues.border}
                    onChange={(e) => handleColorChange("border", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.border}
                  onChange={(e) => handleColorChange("border", e.target.value)}
                  className={styles.textInput}
                  placeholder="#243144"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Texto Principal
                  <input
                    type="color"
                    value={customColorValues.text}
                    onChange={(e) => handleColorChange("text", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.text}
                  onChange={(e) => handleColorChange("text", e.target.value)}
                  className={styles.textInput}
                  placeholder="#e6edf3"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Texto Secundario
                  <input
                    type="color"
                    value={customColorValues.textMuted}
                    onChange={(e) => handleColorChange("textMuted", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.textMuted}
                  onChange={(e) => handleColorChange("textMuted", e.target.value)}
                  className={styles.textInput}
                  placeholder="#a7b3c2"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Color de Acento
                  <input
                    type="color"
                    value={customColorValues.accent}
                    onChange={(e) => handleColorChange("accent", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className={styles.textInput}
                  placeholder="#4c8dff"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Acento Fuerte
                  <input
                    type="color"
                    value={customColorValues.accentStrong}
                    onChange={(e) => handleColorChange("accentStrong", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.accentStrong}
                  onChange={(e) => handleColorChange("accentStrong", e.target.value)}
                  className={styles.textInput}
                  placeholder="#2f6bff"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Éxito
                  <input
                    type="color"
                    value={customColorValues.success}
                    onChange={(e) => handleColorChange("success", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.success}
                  onChange={(e) => handleColorChange("success", e.target.value)}
                  className={styles.textInput}
                  placeholder="#2bb673"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Advertencia
                  <input
                    type="color"
                    value={customColorValues.warning}
                    onChange={(e) => handleColorChange("warning", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.warning}
                  onChange={(e) => handleColorChange("warning", e.target.value)}
                  className={styles.textInput}
                  placeholder="#f2b93b"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Error
                  <input
                    type="color"
                    value={customColorValues.error}
                    onChange={(e) => handleColorChange("error", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.error}
                  onChange={(e) => handleColorChange("error", e.target.value)}
                  className={styles.textInput}
                  placeholder="#e05d5d"
                />
              </div>

              <div className={styles.colorField}>
                <label className={styles.colorLabel}>
                  Foco
                  <input
                    type="color"
                    value={customColorValues.focus}
                    onChange={(e) => handleColorChange("focus", e.target.value)}
                    className={styles.colorInput}
                  />
                </label>
                <input
                  type="text"
                  value={customColorValues.focus}
                  onChange={(e) => handleColorChange("focus", e.target.value)}
                  className={styles.textInput}
                  placeholder="#7aa7ff"
                />
              </div>
            </div>

            <div className={styles.actions}>
              <Button onClick={applyCustomColors} variant="primary">
                Aplicar Colores
              </Button>
              <Button onClick={resetToDefaults} variant="secondary">
                Restaurar Predeterminados
              </Button>
            </div>
          </Card>
        )}

        {/* Vista previa en vivo */}
        <Card title="Vista Previa" className={styles.card}>
          <div className={styles.preview}>
            <div className={styles.previewSection}>
              <h3>Ejemplo de Componentes</h3>
              <p className={styles.previewText}>
                Este es un texto de ejemplo para ver cómo se ven los colores en la interfaz.
              </p>
              <div className={styles.previewButtons}>
                <Button variant="primary">Botón Primario</Button>
                <Button variant="secondary">Botón Secundario</Button>
              </div>
              <div className={styles.previewAlerts}>
                <div className={styles.alertSuccess}>✓ Operación exitosa</div>
                <div className={styles.alertWarning}>⚠ Advertencia</div>
                <div className={styles.alertError}>✕ Error</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Configuracion;
