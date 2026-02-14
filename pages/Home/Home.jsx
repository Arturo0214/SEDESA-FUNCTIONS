import React, { useEffect, useState } from 'react';
import { Container, Row, Col, ListGroup, Card, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../src/features/auth/authSlice';
import FunctionList from '../../components/FunctionList';
import ServiceList from '../../components/ServiceList';
import MatchFunctionsServices from '../../components/MatchFunctionsServices';
import UniqueFunctions from "../../components/UniqueFunctions";
import DuplicatesChart from '../../components/DuplicatesChart';
import Swal from 'sweetalert2';
import { LogOut } from 'lucide-react';
import './Home.scss';

const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('ssp');
  const [functions, setFunctions] = useState([]);
  const [services, setServices] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchFunctions();
      fetchServices();
      fetchMatches();
    }
  }, [user, navigate]);

  const fetchFunctions = async () => {
    try {
      const res = await fetch(`${API_URL}functions`);
      const data = await res.json();
      setFunctions(data);
    } catch (err) {
      console.error('Error fetching functions:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}services`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_URL}matches`);
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
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
        return <MatchFunctionsServices matches={matches} />;
      case 'unique':
        return <UniqueFunctions functions={functions} services={services} matches={matches} />;
      case 'chart':
        return <DuplicatesChart functions={functions} services={services} matches={matches} />;
      default:
        return <p>Selecciona una pestaña</p>;
    }
  };

  return (
    <Container fluid className="app-container p-0">
      <Row className="g-0 h-100">
        {/* Sidebar */}
        <Col className="sidebar p-0">
          <div className="sidebar-header">
            <strong>
              Bienvenido, {user?.name || 'Usuario'}
            </strong>
            <div className="subtitle">
              Al sistema de duplicidades
            </div>
          </div>

          <ListGroup variant="flush" className="sidebar-list">
            <ListGroup.Item
              action
              active={activeTab === 'ssp'}
              onClick={() => setActiveTab('ssp')}
            >
              Funciones SSPCDMX
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'sedesa'}
              onClick={() => setActiveTab('sedesa')}
            >
              Funciones SEDESA
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'match'}
              onClick={() => setActiveTab('match')}
            >
              Match de Ambas
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'unique'}
              onClick={() => setActiveTab('unique')}
            >
              Funciones Únicas
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'chart'}
              onClick={() => setActiveTab('chart')}
            >
              Porcentaje de Duplicidades
            </ListGroup.Item>
          </ListGroup>
          <div className="sidebar-footer">
            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="btn-logout w-100">
              <LogOut size={16} className="me-2" />
              Cerrar sesión
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col className="main-content p-0">
          <div className="main-content-wrapper">
            <Card className="main-content-card">
              <Card.Body>{renderContent()}</Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;