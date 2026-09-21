export const getAssessmentTypeForUser = (educationLevel: string, careerObjective: string): string | null => {
  if (educationLevel === 'Class10') {
    return null;
  }

  if (educationLevel === 'Class11') {
    return 'class_11_stream';
  }

  if (educationLevel === 'Class12') {
    return 'class_12_degree';
  }

  if (educationLevel === 'Diploma') {
    if (careerObjective === 'find_internship') return 'internship_readiness';
    if (careerObjective === 'find_job') return 'job_readiness';
    return null;
  }

  if (educationLevel === 'UG') {
    if (careerObjective === 'find_internship') return 'internship_readiness';
    if (careerObjective === 'find_job') return 'job_readiness';
    return 'ug_career';
  }

  if (educationLevel === 'PG') {
    if (careerObjective === 'find_internship') return 'internship_readiness';
    if (careerObjective === 'find_job') return 'job_readiness';
    return 'pg_career';
  }

  return null;
};
