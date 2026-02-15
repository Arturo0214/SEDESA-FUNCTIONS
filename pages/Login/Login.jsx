import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { login, reset } from '../../src/features/auth/authSlice';
import Swal from 'sweetalert2';

import ResetPassword from '../../components/ResetPassword/ResetPassword';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isSuccess, error, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showResetModal, setShowResetModal] = useState(false);

  const { email, password } = formData;

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message || 'Datos incorrectos',
      });
    }
    if (isSuccess) {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Login exitoso! Redirigiendo...',
        timer: 2000,
        showConfirmButton: false
      });
      setTimeout(() => navigate('/'), 2000);
    }
    dispatch(reset());
  }, [error, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Todos los campos son obligatorios',
      });
      return;
    }
    dispatch(login({ email, password }))
      .unwrap()
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err || 'Error al iniciar sesión',
        });
      });
  };

  return (
    <>
      <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5} xl={4}>
            <Card className="p-4 shadow-lg border-0">
              <Card.Body>
                <h2 className="text-center mb-4 fw-bold">Inicia Sesión</h2>
                {error && <Alert variant="danger">{message}</Alert>}
                <Form onSubmit={onSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-3">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ingresa tu correo"
                      name="email"
                      value={email}
                      onChange={onChange}
                      required
                      className="p-2"
                    />
                  </Form.Group>
                  <Form.Group controlId="formBasicPassword" className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      name="password"
                      value={password}
                      onChange={onChange}
                      required
                      className="p-2"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100 p-2" disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Login'}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <a
                    href="#"
                    className="text-decoration-none text-primary"
                    onClick={() => setShowResetModal(true)} // ✅ Mostrar el modal al hacer clic
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <ResetPassword show={showResetModal} handleClose={() => setShowResetModal(false)} />
    </>
  );
};

export default Login;
