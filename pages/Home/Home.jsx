import React, { useEffect, useState } from 'react';
import { Container, Row, Col, ListGroup, Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../src/features/auth/authSlice';
import FunctionList from '../../components/FunctionList';
import ServiceList from '../../components/ServiceList';
import MatchFunctionsServices from '../../components/MatchFunctionsServices';
import UniqueFunctions from "../../components/UniqueFunctions";
import Swal from 'sweetalert2';
import { LogOut } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('ssp');
  const [functions, setFunctions] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchFunctions();
      fetchServices();
    }
  }, [user, navigate]);

  const fetchFunctions = async () => {
    try {
      const res = await fetch('https://water-clever-sage.glitch.me/functions');
      const data = await res.json();
      setFunctions(data);
    } catch (err) {
      console.error('Error fetching functions:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('https://water-clever-sage.glitch.me/services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Tu sesión se cerrará.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate('/login');
        Swal.fire('Cerrado', 'Tu sesión ha sido cerrada.', 'success');
      }
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'sedesa':
        return <FunctionList functions={functions} setFunctions={setFunctions} fetchFunctions={fetchFunctions} />;
      case 'ssp':
        return <ServiceList services={services} setServices={setServices} fetchServices={fetchServices} />;
      case 'match':
        return <MatchFunctionsServices functions={functions} services={services} />;
      case 'unique':
        return <UniqueFunctions functions={functions} services={services} />;
      default:
        return <p>Selecciona una pestaña</p>;
    }
  };

  return (
    <Container fluid className="p-0" style={{ height: '100vh', fontFamily: 'system-ui' }}>
      <Row className="g-0" style={{ height: '100%' }}>
        {/* Sidebar estilo Finder */}
        <Col style={{ width: '30%', maxWidth: '250px', borderRight: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
          <div className="p-3 border-bottom" style={{ backgroundColor: '#e9ecef' }}>
            <strong style={{ fontSize: '14px' }}>Bienvenido, {user?.name || 'Usuario'}</strong>
            <div style={{ fontSize: '12px', color: '#6c757d' }}>Al sistema de duplicidades</div>
          </div>

          <ListGroup variant="flush">
            <ListGroup.Item
              action
              active={activeTab === 'ssp'}
              onClick={() => setActiveTab('ssp')}
              style={{ fontSize: '14px' }}
            >
              Funciones SSPCDMX
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'sedesa'}
              onClick={() => setActiveTab('sedesa')}
              style={{ fontSize: '14px' }}
            >
              Funciones SEDESA
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'match'}
              onClick={() => setActiveTab('match')}
              style={{ fontSize: '14px' }}
            >
              Match de Ambas
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'unique'}
              onClick={() => setActiveTab('unique')}
              style={{ fontSize: '14px' }}
            >
              Funciones Únicas
            </ListGroup.Item>
          </ListGroup>

          <div className="p-3">
            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="w-100 mt-3">
              <LogOut size={16} className="me-2" />
              Cerrar sesión
            </Button>
          </div>
        </Col>

        {/* Contenido principal */}
        <Col style={{ width: '70%' }} className="p-4">
          <Card style={{ height: '100%', border: 'none' }}>
            <Card.Body>{renderContent()}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;