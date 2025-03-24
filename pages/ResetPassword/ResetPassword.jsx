import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Card, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';
import './ResetPassword.scss';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire('Error', 'Por favor, completa todos los campos.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(`https://duplicidades-sedesa.netlify.app/users/reset-password/${token}`, { password });

      Swal.fire('Éxito', response.data.message, 'success');

      setTimeout(() => {
        navigate('/login'); // Redirige al usuario al login
      }, 2000);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Hubo un problema', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="reset-password-container">
      <Card className="reset-password-card">
        <Card.Body>
          <h2 className="reset-password-title">Restablecer Contraseña</h2>
          <Form onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingrese nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirme la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="reset-password-button w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Actualizar Contraseña'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;
