import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { requestPasswordReset } from '../../src/features/auth/authSlice';

const PasswordResetModal = ({ show, handleClose }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor, ingresa tu correo electrónico.',
      });
      return;
    }

    setLoading(true);

    dispatch(requestPasswordReset({ email }))
      .unwrap()
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
        });
        setEmail('');
        handleClose();
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error || 'No se pudo enviar el correo, intenta nuevamente.',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Restablecer Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="resetEmail">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleReset} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Enviar Correo'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PasswordResetModal;
