import SeedRunner from "../../../components/ui/SeedRunner";

export default function SetupPage() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Project Setup</h1>
      <p>This admin page allows you to run local project seeds and setup helpers.</p>
      <SeedRunner />
    </main>
  );
}
