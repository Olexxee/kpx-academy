import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button";

export const HeroActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full max-w-sm flex-col items-stretch gap-3">
      <Button onClick={() => navigate("/courses")}>
        Explore Programmes
      </Button>

      <Button variant="outline" onClick={() => navigate("/about")}>
        Our Story
      </Button>
    </div>
  );
};
