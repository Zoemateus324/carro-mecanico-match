import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Database } from "@/types/supabase"; // ajuste o caminho

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null); // ou tipar com SupabaseAuthUser
  const [profile, setProfile] = useState<any>(null); // ou tipar com seu profile
  const [limits, setLimits] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
