import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ModalPartes = ({ show, partes, onClose, onClear }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-list-check me-2"></i> Partes Seleccionadas
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {partes.length > 0 ? (
          <ListGroup>
            {partes.map((parte, index) => (
              <ListGroup.Item key={index}>
                <strong>{parte}</strong>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center text-muted">
            <i className="bi bi-info-circle fs-4 d-block mb-2"></i>
            No hay partes seleccionadas.
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          <i className="bi bi-x-lg me-1"></i> Cerrar
        </Button>
        <Button variant="danger" onClick={onClear} disabled={partes.length === 0}>
          <i className="bi bi-trash me-1"></i> Limpiar Selección
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ModalPartes.propTypes = {
  show: PropTypes.bool.isRequired,
  partes: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
};

export default ModalPartes;