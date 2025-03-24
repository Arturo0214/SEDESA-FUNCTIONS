import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    LabelList,
    Cell,
  } from "recharts";
  import { Card } from "react-bootstrap";
  import { BarChart as BarChartIcon } from "lucide-react";
  
  const DuplicatesChart = ({ functions, services, matches }) => {
    // 🔧 Ajustado a tu estructura: match.func._id y match.service._id
    const matchedFunctionIds = new Set(matches.map((m) => String(m.func._id)));
    const matchedServiceIds = new Set(matches.map((m) => String(m.service._id)));
  
    // ✅ Comparación robusta asegurando que los IDs coincidan como string
    const getDuplicatedCount = (items, idSet) =>
      items.reduce((acc, item) => idSet.has(String(item._id)) ? acc + 1 : acc, 0);
  
    const duplicatedFunctions = getDuplicatedCount(functions, matchedFunctionIds);
    const duplicatedServices = getDuplicatedCount(services, matchedServiceIds);
  
    const totalFunctions = functions.length;
    const totalServices = services.length;
    const totalOriginal = totalFunctions + totalServices;
  
    const uniqueFunctions = totalFunctions - duplicatedFunctions;
    const uniqueServices = totalServices - duplicatedServices;
  
    const duplicatedTotal = duplicatedFunctions + duplicatedServices;
    const uniqueTotal = uniqueFunctions + uniqueServices;
  
    const porcentajeDuplicadas = ((duplicatedTotal / totalOriginal) * 100).toFixed(2);
    const porcentajeUnicas = ((uniqueTotal / totalOriginal) * 100).toFixed(2);
  
    const data = [
      { name: "Duplicadas", cantidad: duplicatedTotal },
      { name: "Únicas", cantidad: uniqueTotal },
    ];
  
    return (
      <Card className="shadow-sm border-0 rounded">
        <Card.Body>
          <div className="text-center mb-4">
            <BarChartIcon className="text-primary" size={28} />
            <h5 className="fw-bold mt-2">Porcentaje de Duplicidades</h5>
            <p className="text-muted mb-1">
              🔁 Duplicadas:{" "}
              <span className="fw-bold text-danger">{porcentajeDuplicadas}%</span> | ✅ Únicas:{" "}
              <span className="fw-bold text-success">{porcentajeUnicas}%</span>
            </p>
            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              ({duplicatedFunctions} funciones + {duplicatedServices} servicios duplicados)
            </p>
          </div>
  
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#dc3545", "#198754"][index]} // rojo duplicadas, verde únicas
                  />
                ))}
                <LabelList dataKey="cantidad" position="top" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
    );
  };
  
  export default DuplicatesChart;
  