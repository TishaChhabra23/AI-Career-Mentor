export const getAssessmentTypeForUser = (educationLevel: string, careerObjective: string): string | null => {
  if (educationLevel === 'Class10') {
    return 'class_10_stream';
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
    return 'diploma_career';
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

  return 'ug_career';
};
