import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList, Cell} from "recharts";
import { Card } from "react-bootstrap";
import { BarChart as BarChartIcon } from "lucide-react";
  
  const DuplicatesChart = ({ functions, services, matches }) => {
    const data = [
      { name: "Funciones SSPCDMX", cantidad: functions.length },
      { name: "Funciones SEDESA", cantidad: services.length },
      { name: "Coincidencias", cantidad: matches.length },
    ];
  
    const porcentaje = (
      (matches.length / (functions.length + services.length)) *
      100
    ).toFixed(2);
  
    return (
      <Card className="shadow-sm border-0 rounded">
        <Card.Body>
          <div className="text-center mb-4">
            <BarChartIcon className="text-primary" size={28} />
            <h5 className="fw-bold mt-2">Porcentaje de Duplicidades</h5>
            <p className="text-muted">
              Coincidencias encontradas:{" "}
              <span className="fw-bold text-success">{porcentaje}%</span>
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
                    fill={["#0d6efd", "#20c997", "#ffc107"][index]}
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
  