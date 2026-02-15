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
    <Container fluid className="vh-100 overflow-hidden bg-light p-0">
      <Row className="g-0 h-100">
        {/* Sidebar */}
        <Col xs="auto" className="d-flex flex-column bg-dark text-white border-end border-secondary p-0 shadow" style={{ width: '280px', minWidth: '280px' }}>
          <div className="p-4 border-bottom border-secondary bg-opacity-10 bg-white">
            <strong className="d-block fs-5 fw-bold text-white mb-1">
              Bienvenido, {user?.name || 'Usuario'}
            </strong>
            <div className="small text-white-50 text-uppercase fw-medium">
              Al sistema de duplicidades
            </div>
          </div>

          <ListGroup variant="flush" className="flex-grow-1 overflow-auto py-3">
            <ListGroup.Item
              action
              active={activeTab === 'ssp'}
              className="border-0 py-3 px-4 bg-transparent text-white-50"
              onClick={() => setActiveTab('ssp')}
            >
              Funciones SSPCDMX
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'sedesa'}
              className="border-0 py-3 px-4 bg-transparent text-white-50"
              onClick={() => setActiveTab('sedesa')}
            >
              Funciones SEDESA
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'match'}
              className="border-0 py-3 px-4 bg-transparent text-white-50"
              onClick={() => setActiveTab('match')}
            >
              Match de Ambas
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'unique'}
              className="border-0 py-3 px-4 bg-transparent text-white-50"
              onClick={() => setActiveTab('unique')}
            >
              Funciones Únicas
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={activeTab === 'chart'}
              className="border-0 py-3 px-4 bg-transparent text-white-50"
              onClick={() => setActiveTab('chart')}
            >
              Reportes y Estadísticas
            </ListGroup.Item>
          </ListGroup>
          <div className="p-3 border-top border-secondary bg-opacity-10 bg-black">
            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="w-100 d-flex align-items-center justify-content-center py-2 fw-medium">
              <LogOut size={16} className="me-2" />
              Cerrar sesión
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col className="d-flex flex-column h-100 overflow-hidden bg-light p-0">
          <div className="flex-grow-1 overflow-auto p-4 w-100">
            <Card className="border-0 bg-transparent shadow-none w-100">
              <Card.Body className="p-0">{renderContent()}</Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;