import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCalendarAlt,
  faClinicMedical,
  faMapMarkerAlt,
  faCertificate,
  
} from "@fortawesome/free-solid-svg-icons";
import "../styles/instructorProfile.css"; // Reusing instructor wizard CSS

interface ProfileState {
  role: string;
  userId: number | null;
}

interface DieticianProfileData {
  user_id: number | null;
  specialization: string; // Comma-separated array
  certification: string;
  years_of_experience: string;
  clinic_name: string;
  clinic_address: string;
}

// PostgreSQL Array Formatting Utility (same as Instructor wizard)
const formatArray = (input: string | null): string => {
  if (!input) return "{}";
  const elements = input.split(',').map(e => `"${e.trim()}"`).filter(e => e.length > 2);
  return `{${elements.join(',')}}`;
};


const DieticianProfileWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userId } = (location.state as ProfileState) || {
    role: "",
    userId: null,
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DieticianProfileData>({
    user_id: userId,
    specialization: "",
    certification: "",
    years_of_experience: "",
    clinic_name: "",
    clinic_address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation and Initialization on Load
  useEffect(() => {
    if (!userId || role !== "Dietician") {
      console.error("Dietician Wizard: Missing user details or incorrect role.");
      navigate("/login");
    }
    setFormData((prev) => ({ ...prev, user_id: userId }));
  }, [userId, role, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.certification || !formData.years_of_experience) {
        setError("Please enter your certification and experience.");
        return false;
      }
      if (isNaN(parseInt(formData.years_of_experience))) {
        setError("Years of experience must be a valid number.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.specialization) {
        setError("Please specify your specialization(s).");
        return false;
      }
    }
    if (currentStep === 3) {
        if (!formData.clinic_name || !formData.clinic_address) {
            setError("Please provide your clinic or practice details.");
            return false;
        }
    }
    setError(null);
    return true;
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    if (!formData.user_id) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        user_id: formData.user_id,
        certification: formData.certification,
        specialization: formatArray(formData.specialization), // Format as array literal
        years_of_experience: parseInt(formData.years_of_experience, 10),
        clinic_name: formData.clinic_name,
        clinic_address: formData.clinic_address,
      };

      const res = await axios.post("http://localhost:3000/dietician", payload); 
      
      // Save the specific dietician ID (assuming the backend returns it)
      if (res.data.dietician && res.data.dietician.dietician_id) {
          localStorage.setItem("dieticianId", String(res.data.dietician.dietician_id));
      }
      
      alert(res.data.message);
      navigate("/dietician");
    } catch (err: any) {
      console.error("Profile submission error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save profile. Please ensure your backend is running and data is valid."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 1: Credentials ---
  const Step1: React.FC = () => (
    <>
      <h3 className="step-title">1. Certification & Experience</h3>
      <div className="form-group">
        <FontAwesomeIcon icon={faCertificate} className="input-icon" />
        <input
          type="text"
          name="certification"
          placeholder="Main Certification (e.g., RDN, LD) *"
          value={formData.certification}
          onChange={handleChange}
          required
          maxLength={255}
        />
      </div>
      <div className="form-group">
        <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
        <input
          type="number"
          name="years_of_experience"
          placeholder="Years of Experience *"
          value={formData.years_of_experience}
          onChange={handleChange}
          required
          min="0"
          max="50"
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-primary" onClick={nextStep}>
          Next: Specialization
        </button>
      </div>
    </>
  );

  // --- Step 2: Specialization ---
  const Step2: React.FC = () => (
    <>
      <h3 className="step-title">2. Areas of Expertise</h3>
      <div className="form-group">
        <FontAwesomeIcon icon={faGraduationCap} className="input-icon" />
        <textarea
          name="specialization"
          placeholder="Specialization (e.g., Weight Management, Diabetes, Pediatric Nutrition) - Separate with commas *"
          rows={4}
          value={formData.specialization}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={nextStep}>
          Next: Clinic Details
        </button>
      </div>
    </>
  );
  
  // --- Step 3: Clinic Details ---
  const Step3: React.FC = () => (
    <>
      <h3 className="step-title">3. Clinic / Practice Details</h3>
      <div className="form-group">
        <FontAwesomeIcon icon={faClinicMedical} className="input-icon" />
        <input
          type="text"
          name="clinic_name"
          placeholder="Clinic Name / Practice Name *"
          value={formData.clinic_name}
          onChange={handleChange}
          required
          maxLength={255}
        />
      </div>
      <div className="form-group">
        <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
        <input
          type="text"
          name="clinic_address"
          placeholder="Clinic Address (City, State, or Remote Practice Name) *"
          value={formData.clinic_address}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button
          type="submit"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isLoading || !formData.user_id}
        >
          {isLoading ? "Saving Profile..." : "Complete Dietician Profile"}
        </button>
      </div>
    </>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      default:
        return <div>Profile Complete! Redirecting...</div>;
    }
  };

  return (
    <div className="wizard-container">
      <form onSubmit={step === 3 ? handleSubmit : nextStep} className="wizard-form">
        <h2 className="wizard-title">Dietician Profile Setup</h2>
        <div className="step-indicator">
          <span className={`step ${step === 1 ? "active" : ""}`}>1</span>
          <span className={`step ${step === 2 ? "active" : ""}`}>2</span>
          <span className={`step ${step === 3 ? "active" : ""}`}>3</span>
        </div>

        {error && <p className="error-message">{error}</p>}
        <div className="wizard-content">
          {renderStep()}
        </div>
      </form>
    </div>
  );
};

export default DieticianProfileWizard;
