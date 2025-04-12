import React from 'react';
import { Card, Button, ButtonGroup } from 'react-bootstrap';

const ControlesFlotantes = ({ zoomIn, zoomOut, fitView }) => {
  return (
    <div className="position-absolute bottom-0 start-0 m-3 d-flex">
      <Card className="me-2">
        <Card.Body className="p-2">
          <small className="text-muted d-block">
            <i className="bi bi-mouse"></i> Arrastrar para rotar
          </small>
          <small className="text-muted d-block">
            <i className="bi bi-mouse2"></i> Click derecho para mover
          </small>
          <small className="text-muted d-block">
            <i className="bi bi-mouse3"></i> Rueda para zoom
          </small>
        </Card.Body>
      </Card>
      
      <ButtonGroup vertical>
        <Button variant="light" onClick={zoomIn} title="Acercar">
          <i className="bi bi-plus-lg"></i>
        </Button>
        <Button variant="light" onClick={zoomOut} title="Alejar">
          <i className="bi bi-dash-lg"></i>
        </Button>
        <Button variant="primary" onClick={fitView} title="Vista completa">
          <i className="bi bi-fullscreen"></i>
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default ControlesFlotantes;