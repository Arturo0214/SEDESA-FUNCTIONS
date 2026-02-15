import { useState, useMemo } from "react";
import { Card, Badge, Container, Row, Col, Form, Accordion, Button, ProgressBar } from "react-bootstrap";
import { Search, MapPin, AlertCircle, CheckCircle2, BarChart3, PieChart, FileDown } from "lucide-react";

function UniqueFunctions({ functions, services, matches }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandAll, setExpandAll] = useState(false);

  // 1. Identify Unique Items
  const uniqueData = useMemo(() => {
    const matchedFunctionIds = new Set(matches.map(m => m.func._id));
    const matchedServiceIds = new Set(matches.map(m => m.service._id));

    const uniqueFuncs = functions.filter(f => !matchedFunctionIds.has(f._id));
    const uniqueServs = services.filter(s => !matchedServiceIds.has(s._id));

    return { uniqueFuncs, uniqueServs };
  }, [functions, services, matches]);

  // 2. Group by Area
  const groupByArea = (items) => {
    return items.reduce((acc, item) => {
      const area = item.area || "Sin Área";
      if (!acc[area]) acc[area] = [];
      acc[area].push(item);
      return acc;
    }, {});
  };

  const groupedSEDESA = useMemo(() => groupByArea(uniqueData.uniqueFuncs), [uniqueData.uniqueFuncs]);
  const groupedSSPCDMX = useMemo(() => groupByArea(uniqueData.uniqueServs), [uniqueData.uniqueServs]);

  // 3. Filter Logic (Search by function/service name OR area name)
  const filterGroups = (groups) => {
    if (!searchTerm) return groups;
    const lowerTerm = searchTerm.toLowerCase();

    const filtered = {};
    Object.keys(groups).forEach(area => {
      // Check if area matches
      const areaMatch = area.toLowerCase().includes(lowerTerm);
      // Check if any item matches
      const itemsMatch = groups[area].filter(item => item.name.toLowerCase().includes(lowerTerm));

      if (areaMatch) {
        // If area matches, keep all items
        filtered[area] = groups[area];
      } else if (itemsMatch.length > 0) {
        // If only items match, keep only those items
        filtered[area] = itemsMatch;
      }
    });
    return filtered;
  };

  const visibleSEDESA = filterGroups(groupedSEDESA);
  const visibleSSPCDMX = filterGroups(groupedSSPCDMX);

  // Stats
  const totalUniqueSEDESA = uniqueData.uniqueFuncs.length;
  const totalUniqueSSPCDMX = uniqueData.uniqueServs.length;
  const totalSEDESA = functions.length || 1;
  const totalSSPCDMX = services.length || 1;

  const pctSEDESA = Math.round((totalUniqueSEDESA / totalSEDESA) * 100);
  const pctSSPCDMX = Math.round((totalUniqueSSPCDMX / totalSSPCDMX) * 100);

  const StatCard = ({ title, count, total, pct, color, icon: Icon }) => (
    <Card className="border-0 shadow-sm h-100 overflow-hidden">
      <Card.Body className="d-flex align-items-center gap-3">
        <div className={`p-3 rounded-circle bg-${color} bg-opacity-10 text-${color}`}>
          <Icon size={24} />
        </div>
        <div className="flex-grow-1">
          <h6 className="text-muted text-uppercase small fw-bold mb-1">{title}</h6>
          <div className="d-flex align-items-baseline gap-2">
            <h3 className="fw-bold mb-0 text-dark">{count}</h3>
            <span className="text-secondary small">de {total}</span>
          </div>
          <div className="mt-2 text-xs text-muted d-flex justify-content-between">
            <span>Tasa de Exclusividad</span>
            <span className={`fw-bold text-${color}`}>{pct}%</span>
          </div>
          <ProgressBar now={pct} variant={color} style={{ height: '4px' }} className="mt-1 rounded-pill" />
        </div>
      </Card.Body>
    </Card>
  );

  const AccordionSection = ({ title, groups, color, icon: Icon }) => (
    <Card className="border-0 shadow-sm h-100 bg-white">
      <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Icon className={`text-${color}`} size={20} />
          <h6 className="fw-bold m-0">{title}</h6>
        </div>
        <Badge bg={color} className="rounded-pill px-3">{Object.keys(groups).length} Áreas</Badge>
      </Card.Header>
      <Card.Body className="p-0 bg-light overflow-auto" style={{ maxHeight: '600px' }}>
        {Object.keys(groups).length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Search size={32} className="mb-2 opacity-50" />
            <p className="small">No se encontraron áreas</p>
          </div>
        ) : (
          <Accordion flush alwaysOpen={expandAll}>
            {Object.keys(groups).sort().map((area, idx) => (
              <Accordion.Item eventKey={String(idx)} key={area} className="border-bottom-0 mb-1">
                <Accordion.Header>
                  <div className="d-flex align-items-center w-100 pe-3">
                    <span className="fw-medium text-dark flex-grow-1 text-truncate me-2" style={{ fontSize: '0.95rem' }}>
                      {area}
                    </span>
                    <Badge bg="light" text="dark" className="border fw-normal">
                      {groups[area].length}
                    </Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="p-0 bg-white">
                  <div className="list-group list-group-flush">
                    {groups[area].map(item => (
                      <div key={item._id} className="list-group-item border-0 p-3 hover-bg-light">
                        <div className="d-flex gap-2">
                          <div className={`mt-1 rounded-circle bg-${color} style={{width: 6, height: 6, minWidth: 6}}`} />
                          <div>
                            <p className="fw-semibold text-dark mb-1 small lh-sm">{item.name}</p>
                            <p className="text-muted small m-0 lh-sm opacity-75">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <span className="text-warning">🌟</span> Análisis de Exclusividad
          </h2>
          <p className="text-muted m-0 small">Identificación de brechas y especialización por organismo</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setExpandAll(!expandAll)}>
            {expandAll ? "Colapsar Todo" : "Expandir Todo"}
          </Button>
          <Button variant="primary" size="sm" className="d-flex align-items-center gap-2 disabled">
            <FileDown size={16} /> Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <StatCard
            title="Funciones Únicas SEDESA"
            count={totalUniqueSEDESA}
            total={totalSEDESA}
            pct={pctSEDESA}
            color="primary"
            icon={BarChart3}
          />
        </Col>
        <Col md={6}>
          <StatCard
            title="Servicios Únicos SSPCDMX"
            count={totalUniqueSSPCDMX}
            total={totalSSPCDMX}
            pct={pctSSPCDMX}
            color="success"
            icon={PieChart}
          />
        </Col>
      </Row>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-3 shadow-sm border mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 text-muted"><Search size={16} /></span>
          <Form.Control
            placeholder="Buscar por nombre de función, servicio o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-start-0 shadow-none py-2"
          />
        </div>
      </div>

      {/* Main Content: Grouped Lists */}
      <Row className="g-4">
        <Col lg={6}>
          <AccordionSection
            title="Exclusivo SEDESA"
            groups={visibleSEDESA}
            color="primary"
            icon={AlertCircle}
          />
        </Col>
        <Col lg={6}>
          <AccordionSection
            title="Exclusivo SSPCDMX"
            groups={visibleSSPCDMX}
            color="success"
            icon={CheckCircle2}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default UniqueFunctions;
