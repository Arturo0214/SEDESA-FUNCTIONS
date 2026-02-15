import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { register, reset } from '../../src/features/auth/authSlice';
import Swal from 'sweetalert2';


const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isSuccess, message } = useSelector(state => state.auth);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message || 'Hubo un error en el registro',
      });
    }
    if (isSuccess) {
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Redirigiendo al login...',
        timer: 2000,
        showConfirmButton: false
      });
      setTimeout(() => navigate('/login'), 2000);
    }
    dispatch(reset());
  }, [error, isSuccess, message, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }
    dispatch(register({ name: formData.name, email: formData.email, password: formData.password }));
  };

  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
          <Card className="p-4 shadow-lg border-0">
            <Card.Body>
              <h2 className="text-center mb-4 fw-bold">Crear Cuenta</h2>
              {error && <Alert variant="danger">{message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formName" className="mb-3">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="p-2"
                  />
                </Form.Group>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="p-2"
                  />
                </Form.Group>
                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="p-2"
                  />
                </Form.Group>
                <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirma tu contraseña"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="p-2"
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 p-2" disabled={isLoading}>
                  {isLoading ? <Spinner animation="border" size="sm" /> : 'Registrarse'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <span className="text-muted">¿Ya tienes una cuenta? </span>
                <a href="/login" className="text-decoration-none text-primary">Iniciar sesión</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register