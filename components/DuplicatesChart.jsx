import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Card, Row, Col, Button, Container } from "react-bootstrap";
import { Copy, CheckCircle, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const StatsCard = ({ title, value, percentage, icon: Icon, color, subtext }) => (
  <Card className="h-100 border-0 shadow-sm bg-white overflow-hidden">
    <Card.Body className="p-4 d-flex align-items-center justify-content-between">
      <div>
        <p className="text-muted fw-semibold mb-1 small text-uppercase" style={{ letterSpacing: '0.05em' }}>{title}</p>
        <div className="d-flex align-items-baseline gap-2">
          <h2 className="fw-bold mb-0 text-dark display-6">{value}</h2>
          {percentage && (
            <span className={`small fw-bold px-2 py-1 rounded-pill bg-${color} bg-opacity-10 text-${color}`}>
              {percentage}%
            </span>
          )}
        </div>
        {subtext && <p className="text-muted small mt-2 mb-0">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-circle bg-${color} bg-opacity-10 text-${color}`}>
        <Icon size={32} />
      </div>
    </Card.Body>
  </Card>
);

const DuplicatesChart = ({ functions, services, matches }) => {
  // --- Data Processing ---
  const stats = useMemo(() => {
    // Basic Counts
    const totalFunctions = functions.length || 0;
    const totalServices = services.length || 0;
    const totalItems = totalFunctions + totalServices;

    // Identified Matches
    // Note: 'matches' contains the pairs. 
    // Example: [{func: {_id: 1}, service: {_id: 2}}, ...]
    const matchedFuncIds = new Set(matches.map(m => m.func._id));
    const matchedServIds = new Set(matches.map(m => m.service._id));

    const duplicateFuncCount = matchedFuncIds.size;
    const duplicateServCount = matchedServIds.size;
    const totalDuplicates = duplicateFuncCount + duplicateServCount;

    const uniqueFuncCount = totalFunctions - duplicateFuncCount;
    const uniqueServCount = totalServices - duplicateServCount;
    const totalUnique = uniqueFuncCount + uniqueServCount;

    // Percentages
    const dupPercent = totalItems ? ((totalDuplicates / totalItems) * 100).toFixed(1) : 0;
    const uniquePercent = totalItems ? ((totalUnique / totalItems) * 100).toFixed(1) : 0;

    return {
      totalFunctions,
      totalServices,
      totalItems,
      duplicateFuncCount,
      duplicateServCount,
      totalDuplicates,
      uniqueFuncCount,
      uniqueServCount,
      totalUnique,
      dupPercent,
      uniquePercent
    };
  }, [functions, services, matches]);

  // --- Chart Data ---
  const barData = [
    { name: "Duplicados", cantidad: stats.totalDuplicates, fill: "#ef4444" }, // Red
    { name: "Únicos", cantidad: stats.totalUnique, fill: "#10b981" },    // Green
  ];

  const pieData = [
    { name: "Funciones SEDESA", value: stats.totalFunctions, fill: "#0d6efd" },
    { name: "Servicios SSPCDMX", value: stats.totalServices, fill: "#198754" },
  ];

  // --- Export Logic ---
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Resumen General
    const summaryData = [
      ["Métrica", "Valor"],
      ["Total de Elementos", stats.totalItems],
      ["Funciones SEDESA", stats.totalFunctions],
      ["Servicios SSPCDMX", stats.totalServices],
      ["Total Duplicidades Detectadas", stats.totalDuplicates],
      ["Elementos Únicos", stats.totalUnique],
      ["Porcentaje de Duplicidad", `${stats.dupPercent}%`],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

    // Sheet 2: Todas las Funciones (SEDESA) with status
    const matchedFuncIds = new Set(matches.map(m => m.func._id));
    const funcData = functions.map(f => ({
      ID: f._id,
      Nombre: f.name,
      Area: f.area || "Sin Área",
      Descripcion: f.description,
      Estado: matchedFuncIds.has(f._id) ? "Duplicado" : "Único"
    }));
    const wsFuncs = XLSX.utils.json_to_sheet(funcData);
    XLSX.utils.book_append_sheet(wb, wsFuncs, "Funciones SEDESA");

    // Sheet 3: Todos los Servicios (SSPCDMX) with status
    const matchedServIds = new Set(matches.map(m => m.service._id));
    const servData = services.map(s => ({
      ID: s._id,
      Nombre: s.name,
      Area: s.area || "Sin Área",
      Descripcion: s.description,
      Estado: matchedServIds.has(s._id) ? "Duplicado" : "Único"
    }));
    const wsServs = XLSX.utils.json_to_sheet(servData);
    XLSX.utils.book_append_sheet(wb, wsServs, "Servicios SSPCDMX");

    // Sheet 4: Detalle de Duplicidades (Matches)
    const matchData = matches.map(m => ({
      "Función SEDESA": m.func.name,
      "Area SEDESA": m.func.area,
      "Servicio SSPCDMX": m.service.name,
      "Area SSPCDMX": m.service.area,
      "Similitud": `${(m.similarity * 100).toFixed(1)}%`,
    }));
    const wsMatches = XLSX.utils.json_to_sheet(matchData);
    XLSX.utils.book_append_sheet(wb, wsMatches, "Duplicidades");

    // Generate Excel File
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `Reporte_Duplicidades_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Container fluid className="px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <span className="text-secondary">📈</span> Reportes y Estadísticas
          </h2>
          <p className="text-muted m-0 small">Visión general del sistema y descarga de datos</p>
        </div>
        <Button
          variant="success"
          onClick={exportToExcel}
          className="d-flex align-items-center gap-2 px-3 py-2 fw-medium shadow-sm border-0"
          style={{ backgroundColor: '#107c41' }} // Excel green
        >
          <FileSpreadsheet size={18} />
          Descargar Reporte Excel
        </Button>
      </div>

      {/* KPI Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <StatsCard
            title="Total Elementos"
            value={stats.totalItems}
            icon={FileSpreadsheet}
            color="primary"
            subtext={`${stats.totalFunctions} Funciones + ${stats.totalServices} Servicios`}
          />
        </Col>
        <Col md={4}>
          <StatsCard
            title="Duplicidades Detectadas"
            value={stats.totalDuplicates}
            percentage={stats.dupPercent}
            icon={Copy}
            color="danger"
            subtext="Elementos presentes en ambas instituciones"
          />
        </Col>
        <Col md={4}>
          <StatsCard
            title="Elementos Únicos"
            value={stats.totalUnique}
            percentage={stats.uniquePercent}
            icon={CheckCircle}
            color="success"
            subtext="Elementos exclusivos sin redundancia"
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 rounded-4 h-100 bg-white">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-dark">Comparativa de Duplicidad</h5>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={barData} barSize={60} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 rounded-4 h-100 bg-white">
            <Card.Body className="p-4 d-flex flex-column">
              <h5 className="fw-bold mb-4 text-dark">Distribución por Origen</h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-3">
                {pieData.map((item, index) => (
                  <div key={index} className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle" style={{ width: 10, height: 10, backgroundColor: item.fill }}></div>
                      <span className="text-secondary small fw-medium">{item.name}</span>
                    </div>
                    <span className="fw-bold small">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DuplicatesChart;
