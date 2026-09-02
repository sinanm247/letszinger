import { Route, Routes } from "react-router-dom";

export default function AppRouter({ routes }) {
  return (
    <Routes>
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}
