import React, { useState, useMemo } from 'react';
import { 
  Col, 
  Card, 
  Button, 
  ButtonGroup, 
  Form, 
  ListGroup, 
  Badge, 
  OverlayTrigger, 
  Tooltip 
} from 'react-bootstrap';
import PropTypes from 'prop-types';

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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter registered parts based on search term
  const filteredParts = useMemo(() => {
    if (!searchTerm) return registeredParts;
    const term = searchTerm.toLowerCase();
    return registeredParts.filter(part => 
      part.customName.toLowerCase().includes(term) || 
      part.originalName.toLowerCase().includes(term)
    );
  }, [registeredParts, searchTerm]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === "default" ? "wireframe" : "default");
  };

  const formatPosition = (pos) => {
    if (!pos) return null;
    return `X: ${pos[0].toFixed(2)}, Y: ${pos[1].toFixed(2)}, Z: ${pos[2].toFixed(2)}`;
  };

  return (
    <Col lg={3} className="p-3 bg-light d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* Part Information Card */}
      <Card className="mb-3 shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Información de Parte
            </Card.Title>
            <Badge bg={selectedPart ? "primary" : "secondary"} pill>
              {selectedPart ? "Seleccionada" : "Ninguna"}
            </Badge>
          </div>
          
          {selectedPart ? (
            <>
              <div className="mb-3">
                <h5 className="text-truncate">{selectedPart}</h5>
                {partPosition && (
                  <div className="mt-2">
                    <small className="text-muted d-block">Posición:</small>
                    <code className="d-block p-2 bg-light rounded">
                      {formatPosition(partPosition)}
                    </code>
                  </div>
                )}
              </div>
              
              <div className="d-grid gap-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Registrar esta parte con un nombre personalizado</Tooltip>}
                >
                  <Button
                    variant="primary"
                    onClick={() => setShowRegisterModal(true)}
                    disabled={!selectedPart || !partPosition}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Registrar Parte
                  </Button>
                </OverlayTrigger>
                
                {selectedPart && (
                  <Button
                    variant="outline-primary"
                    onClick={fitViewToSelection}
                  >
                    <i className="bi bi-zoom-in me-2"></i>
                    Centrar Vista
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-3 text-muted">
              Selecciona una parte del modelo 3D
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Registered Parts Card */}
      <Card className="mb-3 flex-grow-1 shadow-sm border-0">
        <Card.Body className="d-flex flex-column p-0 h-100">
          <div className="p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">
                Partes Registradas
              </Card.Title>
              <Badge bg="light" text="dark" pill>
                {registeredParts.length}
              </Badge>
            </div>
            <Form.Control 
              type="text" 
              placeholder="Buscar parte..." 
              className="my-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={registeredParts.length === 0}
            />
          </div>
          
          <div className="flex-grow-1 overflow-auto">
            {filteredParts.length > 0 ? (
              <ListGroup variant="flush">
                {filteredParts.map((part) => (
                  <ListGroup.Item 
                    key={part.id} 
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="me-2">
                      <div className="fw-bold text-truncate">{part.customName}</div>
                      <small className="text-muted d-block text-truncate">{part.originalName}</small>
                      <small className="text-muted">{formatPosition(part.position)}</small>
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
                        <i className="bi bi-trash"></i>
                      </Button>
                    </OverlayTrigger>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-5 text-muted">
                {searchTerm ? 
                  "No se encontraron resultados" : 
                  "No hay partes registradas"}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Controls Card */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Card.Title>Controles de Vista</Card.Title>
          
          <div className="d-grid gap-2">
            <ButtonGroup className="mb-2">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Mostrar/ocultar cuadrícula</Tooltip>}
              >
                <Button
                  variant={showGrid ? 'primary' : 'outline-secondary'}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <i className="bi bi-grid me-2"></i>
                  Grid
                </Button>
              </OverlayTrigger>
              
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Cambiar a vista wireframe</Tooltip>}
              >
                <Button
                  variant={viewMode === 'wireframe' ? 'primary' : 'outline-secondary'}
                  onClick={toggleViewMode}
                >
                  <i className="bi bi-bounding-box me-2"></i>
                  Wireframe
                </Button>
                {/* Cambiar a vista normal */}
              </OverlayTrigger>
            </ButtonGroup>
            
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Restablecer la vista a la posición inicial</Tooltip>}
            >
              <Button 
                variant="outline-secondary"
                onClick={resetView}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
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