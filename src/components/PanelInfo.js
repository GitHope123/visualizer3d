import React, { useState, useMemo } from "react";
import { FaList, FaInfoCircle, FaPlus, FaSearchPlus, FaTrash, FaSlidersH, FaTh, FaCube, FaRedo, FaMoon, FaSun } from "react-icons/fa";
import {
  Col,
  Card,
  Button,
  ButtonGroup,
  Form,
  ListGroup,
  Badge,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import PropTypes from "prop-types";

const PanelInfo = ({
  selectedPart,
  partPosition,
  registeredParts,
  showGrid,
  setShowGrid,
  viewMode,
  setViewMode,
  controlsRef,
  setShowRegisterModal,
  removeRegisteredPart,
  fitViewToSelection,
  resetView,
  isDarkMode,      // Receive as prop
  toggleDarkMode,  // Receive as prop
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Remove local state: const [isDarkMode, setIsDarkMode] = useState(false);
  // Remove local toggle: const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const [isLoading, setIsLoading] = useState(false);

  const filteredParts = useMemo(() => {
    if (!searchTerm) return registeredParts;
    const term = searchTerm.toLowerCase();
    return registeredParts.filter(
      (part) =>
        part.customName.toLowerCase().includes(term) ||
        part.originalName.toLowerCase().includes(term)
    );
  }, [registeredParts, searchTerm]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "default" ? "wireframe" : "default"));
  };

  const formatPosition = (pos) => {
    if (!pos) return null;
    return `X: ${pos[0].toFixed(2)}, Y: ${pos[1].toFixed(
      2
    )}, Z: ${pos[2].toFixed(2)}`;
  };

  return (
    <Col
      lg={3}
      className={`p-3 ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'} d-flex flex-column`}
      style={{ minHeight: "100vh" }} // Ensure panel takes full height
    >
      {/* Información de Parte */}
      <Card className={`mb-3 ${isDarkMode ? 'bg-secondary text-light' : 'bg-white text-dark'} border-0 shadow-sm`}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className={`mb-0 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
              <FaInfoCircle className="me-2" />
              Información de Parte
            </Card.Title>
            <Badge bg={selectedPart ? "primary" : "secondary"} text="light" pill>
              {selectedPart ? "Seleccionada" : "Ninguna"}
            </Badge>
          </div>

          {selectedPart ? (
            <>
              <div className="mb-3">
                <h5 className={`text-truncate ${isDarkMode ? 'text-light' : 'text-dark'}`}>{selectedPart}</h5>
                {partPosition && (
                  <div className="mt-2">
                    <small className={`${isDarkMode ? 'text-light' : 'text-muted'} d-block`}>Posición:</small>
                    <code className={`d-block p-2 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'} rounded border`}>
                      {formatPosition(partPosition)}
                    </code>
                  </div>
                )}
              </div>

              <div className="d-grid gap-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Registrar esta parte</Tooltip>}
                >
                  <Button
                    variant="primary"
                    onClick={() => setShowRegisterModal(true)}
                    disabled={!selectedPart || !partPosition}
                  >
                    <FaPlus className="me-2" />
                    Registrar Parte
                  </Button>
                </OverlayTrigger>

                <Button variant={isDarkMode ? "outline-light" : "outline-dark"} onClick={fitViewToSelection}>
                  <FaSearchPlus className="me-2" />
                  Centrar Vista
                </Button>
              </div>
            </>
          ) : (
            <div className={`text-center py-3 ${isDarkMode ? 'text-light' : 'text-muted'}`}>
              Selecciona una parte del modelo 3D
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Partes Registradas */}
      <Card className={`mb-0 ${isDarkMode ? 'bg-secondary text-light' : 'bg-white text-dark'} border-0 shadow-sm flex-grow-1 d-flex flex-column`}>
        <Card.Body className="d-flex flex-column p-0">
          <div className={`p-3 border-bottom ${isDarkMode ? 'border-dark' : 'border-light'}`}>
            <div className="d-flex justify-content-between align-items-center">
              <Card.Title className={`mb-0 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                Partes Registradas
                <FaList className="ms-2" />
              </Card.Title>
              <Badge bg="primary" text="light" pill>
                {registeredParts.length}
              </Badge>
            </div>
            <Form.Control
              type="text"
              placeholder="Buscar parte..."
              className={`my-2 ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={registeredParts.length === 0}
              style={isDarkMode ? {
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
              } : {}}
            />
          </div>

          <div className="overflow-auto flex-grow-1" style={{ minHeight: "150px" }}> {/* Ensure list takes remaining space */}
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant={isDarkMode ? 'light' : 'dark'} />
                <p className={`mt-2 ${isDarkMode ? 'text-light' : 'text-muted'}`}>Cargando...</p>
              </div>
            ) : filteredParts.length > 0 ? (
              <ListGroup variant="flush">
                {filteredParts.map((part) => (
                  <ListGroup.Item
                    key={part.id}
                    className={`${isDarkMode ? 'bg-secondary text-light border-dark' : 'bg-white text-dark border-light'} d-flex justify-content-between align-items-center`}
                  >
                    <div className="me-2" style={{ minWidth: 0 }}>
                      <div className={`fw-bold text-truncate ${isDarkMode ? 'text-light' : 'text-dark'}`}>
                        {part.customName}
                      </div>
                      <small className={`${isDarkMode ? 'text-light' : 'text-muted'} d-block text-truncate`}>
                        {part.originalName}
                      </small>
                      <small className={`${isDarkMode ? 'text-light' : 'text-muted'} d-block text-truncate`}>
                        {formatPosition(part.position)}
                      </small>
                    </div>
                    <OverlayTrigger
                      placement="left"
                      overlay={<Tooltip>Eliminar esta parte</Tooltip>}
                    >
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeRegisteredPart(part.id)}
                        className="flex-shrink-0"
                      >
                        <FaTrash />
                      </Button>
                    </OverlayTrigger>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className={`text-center py-5 ${isDarkMode ? 'text-light' : 'text-muted'}`}>
                {searchTerm
                  ? "No se encontraron resultados"
                  : "No hay partes registradas"}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Controles */}  
      <Card className={`${isDarkMode ? 'bg-secondary text-light' : 'bg-white text-dark'} border-0 shadow-sm mt-auto`}> {/* Use mt-auto to push to bottom */}
        <Card.Body>
          <Card.Title className={`${isDarkMode ? 'text-light' : 'text-dark'}`}>
            Controles de Vista
            <FaSlidersH className="ms-2" />
          </Card.Title>

          <div className="d-grid gap-2">
            <ButtonGroup className="mb-2">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Mostrar/ocultar cuadrícula</Tooltip>}
              >
                <Button
                  variant={showGrid ? "primary" : (isDarkMode ? "outline-light" : "outline-secondary")}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <FaTh className="me-1" />
                  Grid
                </Button>
              </OverlayTrigger>

              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Cambiar vista {viewMode === 'wireframe' ? 'normal' : 'wireframe'}</Tooltip>}
              >
                <Button
                  variant={viewMode === "wireframe" ? "primary" : (isDarkMode ? "outline-light" : "outline-secondary")}
                  onClick={toggleViewMode}
                >
                  <FaCube className="me-1" />
                  Wireframe
                </Button>
              </OverlayTrigger>
              
              {/* --- Dark Mode Toggle Button --- */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</Tooltip>}
              >
                <Button
                  variant={isDarkMode ? "primary" : (isDarkMode ? "outline-light" : "outline-secondary")}
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <FaSun className="me-1"/> : <FaMoon className="me-1" />} 
                  {isDarkMode ? 'Claro' : 'Oscuro'} 
                </Button>
              </OverlayTrigger>
              {/* --- End Dark Mode Toggle Button --- */}

            </ButtonGroup>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Restablecer vista</Tooltip>}
            >
              <Button variant={isDarkMode ? "outline-light" : "outline-secondary"} onClick={resetView}>
                <FaRedo className="me-2" />
                Resetear Vista
              </Button>
            </OverlayTrigger>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

PanelInfo.propTypes = {
  selectedPart: PropTypes.string,
  partPosition: PropTypes.array,
  registeredParts: PropTypes.array.isRequired,
  showGrid: PropTypes.bool.isRequired,
  setShowGrid: PropTypes.func.isRequired,
  viewMode: PropTypes.string.isRequired,
  setViewMode: PropTypes.func.isRequired,
  controlsRef: PropTypes.object.isRequired, // Assuming controlsRef is still needed
  setShowRegisterModal: PropTypes.func.isRequired,
  removeRegisteredPart: PropTypes.func.isRequired,
  fitViewToSelection: PropTypes.func.isRequired,
  resetView: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,      // Added prop type
  toggleDarkMode: PropTypes.func.isRequired, // Added prop type
};

export default React.memo(PanelInfo);
