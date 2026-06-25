import CTASection from "@/components/home/Ctasection";
import FeaturesSection from "@/components/home/Feature";
import Hero from "@/components/home/Hero";
import ProblemSection from "@/components/home/Problemsection";
import RolesSection from "@/components/home/Rolessection";
import WorkflowSection from "@/components/home/Workflowsection";

export default function HomePage() {
  return (
    <main className="bg-page">

      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <WorkflowSection />
      <RolesSection />
      <CTASection />

    </main>
  );
}