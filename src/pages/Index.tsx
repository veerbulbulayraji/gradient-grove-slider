import GradientEditor from "@/components/GradientEditor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <h1 className="text-4xl font-bold text-center mb-8">CSS Gradient Generator</h1>
        <GradientEditor />
      </div>
    </div>
  );
};

export default Index;