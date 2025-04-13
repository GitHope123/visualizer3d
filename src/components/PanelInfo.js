import React, { useState, useMemo } from "react";
import { FaList, FaInfoCircle, FaPlus, FaSearchPlus, FaTrash, FaSlidersH, FaTh, FaCube, FaRedo } from "react-icons/fa";
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
}) => {
  const [searchTerm, setSearchTerm] = useState("");
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
      className="p-3 bg-dark text-light d-flex flex-column"
      style={{ minHeight: "50vh" }}
    >
      {/* Información de Parte */}
      <Card className="mb-3 bg-secondary text-light border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className="mb-0 text-light">
              <FaInfoCircle className="me-2" />
              Información de Parte
            </Card.Title>
            <Badge bg={selectedPart ? "primary" : "dark"} text="light" pill>
              {selectedPart ? "Seleccionada" : "Ninguna"}
            </Badge>
          </div>

          {selectedPart ? (
            <>
              <div className="mb-3">
                <h5 className="text-truncate text-light">{selectedPart}</h5>
                {partPosition && (
                  <div className="mt-2">
                    <small className="text-muted d-block">Posición:</small>
                    <code className="d-block p-2 bg-dark text-light rounded border border-secondary">
                      {formatPosition(partPosition)}
                    </code>
                  </div>
                )}
              </div>

              <div className="d-grid gap-2">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      Registrar esta parte con un nombre personalizado
                    </Tooltip>
                  }
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

                <Button variant="outline-light" onClick={fitViewToSelection}>
                  <i className="bi bi-zoom-in me-2"></i>
                  Centrar Vista
                </Button>                
              </div>
            </>
          ) : (
            <div className="text-center py-3 text-muted">
              Selecciona una parte del modelo 3D
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Partes Registradas */}
      <Card className="mb-3 bg-secondary text-light border-0 shadow-sm">
        <Card.Body className="d-flex flex-column p-0">
          <div className="p-3 border-bottom border-dark">
            <div className="d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0 text-light">
                Partes Registradas
                <FaList className="ms-2" />
              </Card.Title>
              <Badge bg="dark" text="light" pill>
                {registeredParts.length}
              </Badge>
            </div>
            <Form.Control
              type="text"
              placeholder="Buscar parte..."
              className="my-2 bg-light text-dark custom-placeholder"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={registeredParts.length === 0}
              style={{
                color: "white",
                backgroundColor: "transparent",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>

          <div className="overflow-auto" style={{ maxHeight: "300px" }}>
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2 text-muted">Cargando...</p>
              </div>
            ) : filteredParts.length > 0 ? (
              <ListGroup variant="flush">
                {filteredParts.map((part) => (
                  <ListGroup.Item
                    key={part.id}
                    className="bg-dark text-light border-secondary d-flex justify-content-between align-items-center"
                  >
                    <div className="me-2" style={{ minWidth: 0 }}>
                      <div className="text-light fw-bold text-truncate">
                        {part.customName}
                      </div>
                      <small className="text-white d-block text-truncate">
                        {part.originalName}
                      </small>
                      <small className="text-white d-block text-truncate">
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
              <div className="text-center py-5 text-muted">
                {searchTerm
                  ? "No se encontraron resultados"
                  : "No hay partes registradas"}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Controles */}
      <Card className="bg-secondary text-light border-0 shadow-sm">
        <Card.Body>
          <Card.Title className="text-light">
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
                  variant={showGrid ? "primary" : "outline-light"}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <FaTh className="me-2" />
                  Grid
                </Button>
              </OverlayTrigger>

              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Cambiar a vista wireframe</Tooltip>}
              >
                <Button
                  variant={
                    viewMode === "wireframe" ? "primary" : "outline-light"
                  }
                  onClick={toggleViewMode}
                >
                  <FaCube className="me-2" />
                  Wireframe
                </Button>
              </OverlayTrigger>
            </ButtonGroup>

            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>Restablecer la vista a la posición inicial</Tooltip>
              }
            >
              <Button variant="outline-light" onClick={resetView}>
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
  controlsRef: PropTypes.object.isRequired,
  setShowRegisterModal: PropTypes.func.isRequired,
  removeRegisteredPart: PropTypes.func.isRequired,
  fitViewToSelection: PropTypes.func.isRequired,
  resetView: PropTypes.func.isRequired,
};

export default React.memo(PanelInfo);
