import { useEffect, useState, useMemo, useRef } from "react";
import { Card, Button, Badge, Row, Col, Pagination, Container } from "react-bootstrap";
import Filters from "./Filters";

const API_URL = import.meta.env.VITE_API_URL;

function ServiceList() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const paginationRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedArea]);

  useEffect(() => {
    if (paginationRef.current) {
      paginationRef.current.scrollLeft = 0;
    }
  }, [currentPage]);

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

  return (
    <Container fluid className="px-3" style={{ height: "100%", overflow: "hidden" }}>
      <Card className="shadow-sm" style={{ height: "100%", overflow: "hidden", position: "relative" }}>
        <Card.Body className="d-flex flex-column p-0">
          {/* Header sticky */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              backgroundColor: "white",
              paddingBottom: "1rem",
              paddingTop: "0.75rem",
              borderBottom: "1px solid #ccc"
            }}
          >
            <h6 className="fw-bold text-center mb-2" style={{ fontSize: "1.1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              🩺 Funciones de SSPCDMX
            </h6>
            <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />
          </div>

          {/* Contenido con scroll */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1rem", paddingBottom: "90px", overflowX: "hidden" }}>
            <Row className="g-2">
              {paginatedItems.map((service) => (
                <Col key={service._id} xs={12} sm={6} md={4} lg={3}>
                  <Card className="h-100 shadow-sm border-primary" style={{ padding: "10px", fontSize: "0.9rem" }}>
                    <Card.Body className="d-flex flex-column">
                      <h6 className="fw-bold text-primary">{service.name}</h6>
                      <p className="text-muted small flex-grow-1">{service.description}</p>
                      <Badge bg="info">{service.area}</Badge>
                      <div className="mt-3 d-flex justify-content-end gap-2">
                        <Button variant="warning" size="sm" onClick={() => handleEdit(service)}>
                          ✏️ Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(service._id)}>
                          🗑️ Eliminar
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Paginación sticky */}
          {totalPages > 1 && (
            <div
              ref={paginationRef}
              style={{
                overflowX: "auto",
                whiteSpace: "nowrap",
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "white",
                padding: "10px 0",
                zIndex: 20,
                borderTop: "1px solid #ccc"
              }}
            >
              <Row>
                <Col className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                  <Pagination className="mb-0">
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {(() => {
                      const pagesToShow = 10;
                      const startPage = Math.floor((currentPage - 1) / pagesToShow) * pagesToShow + 1;
                      const endPage = Math.min(startPage + pagesToShow - 1, totalPages);
                      const items = [];

                      for (let i = startPage; i <= endPage; i++) {
                        items.push(
                          <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
                            {i}
                          </Pagination.Item>
                        );
                      }

                      if (endPage < totalPages) {
                        items.push(<Pagination.Ellipsis key="ellipsis" disabled />);
                        items.push(
                          <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
                            {totalPages}
                          </Pagination.Item>
                        );
                      }

                      return items;
                    })()}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                  </Pagination>

                  <small className="text-muted ms-2">Total: {totalPages} páginas</small>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ServiceList;