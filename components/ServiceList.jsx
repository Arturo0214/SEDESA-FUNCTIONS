import { useEffect, useState, useMemo, useRef } from "react";
import { Card, Button, Badge, Row, Col, Pagination, Container } from "react-bootstrap";
import { Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Filters from "./Filters";

const API_URL = import.meta.env.VITE_API_URL;

function ServiceList() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedArea]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}services`);
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;

    try {
      const response = await fetch(`${API_URL}services/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error al eliminar el servicio");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleEdit = (service) => {
    console.log("Editar servicio:", service);
  };

  const uniqueAreas = useMemo(() => [...new Set(services.map((s) => s.area))], [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedArea === "" || s.area === selectedArea)
      );
    });
  }, [services, searchTerm, selectedArea]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedItems = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let number = 1; number <= totalPages; number++) {
        items.push(
          <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
            {number}
          </Pagination.Item>
        );
      }
    } else {
      items.push(
        <Pagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );

      if (currentPage > 3) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = 4;
      }
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      for (let number = startPage; number <= endPage; number++) {
        items.push(
          <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
            {number}
          </Pagination.Item>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }

      items.push(
        <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }
    return items;
  };

  return (
    <Container fluid className="px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <span className="text-success">🩺</span> Funciones de SSPCDMX
        </h2>
        <Badge bg="light" text="dark" className="border px-3 py-2 fs-6">
          Total: {filteredServices.length}
        </Badge>
      </div>

      <div className="bg-white p-3 rounded-3 shadow-sm border mb-4">
        <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />
      </div>

      <Row className="g-4">
        {paginatedItems.map((service) => (
          <Col key={service._id} xs={12} md={6} lg={4} xl={4}>
            <Card className="service-card h-100 border-0" style={{ minHeight: '320px' }}>
              <Card.Body className="d-flex flex-column h-100 p-4">
                <div className="mb-3">
                  <Badge
                    bg="success"
                    className="bg-opacity-10 text-success px-3 py-2 rounded-3 fw-semibold border border-success border-opacity-25 w-100 text-wrap text-start lh-sm"
                  >
                    {service.area}
                  </Badge>
                </div>

                <div className="mb-3" style={{ minHeight: '60px' }}>
                  <Card.Title
                    className="fw-bold text-dark m-0 fs-5 lh-sm"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {service.name}
                  </Card.Title>
                </div>

                <div className="flex-grow-1 mb-4 position-relative">
                  <Card.Text className="text-secondary small overflow-auto custom-scrollbar" style={{ maxHeight: '120px', paddingRight: '5px' }}>
                    {service.description}
                  </Card.Text>
                </div>

                <div className="mt-auto d-flex justify-content-end gap-2 pt-3 border-top w-100">
                  <Button variant="outline-warning" size="sm" className="d-flex align-items-center gap-1 px-3" onClick={() => handleEdit(service)}>
                    <Pencil size={14} /> Editar
                  </Button>
                  <Button variant="outline-danger" size="sm" className="d-flex align-items-center gap-1 px-3" onClick={() => handleDelete(service._id)}>
                    <Trash2 size={14} /> Eliminar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {totalPages > 1 && (
        <div className="mt-5 d-flex justify-content-center">
          <Pagination className="shadow-sm rounded-pill overflow-hidden">
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-0"
            >
              <ChevronLeft size={18} />
            </Pagination.Prev>

            {renderPaginationItems()}

            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-0"
            >
              <ChevronRight size={18} />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
    </Container>
  );
}

export default ServiceList;