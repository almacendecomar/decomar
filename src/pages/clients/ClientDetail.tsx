import React from 'react';
import { useParams } from 'react-router-dom';

const ClientDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Client Details</h1>
      <p className="text-gray-600">Client ID: {id}</p>
      {/* Additional client details will be implemented later */}
    </div>
  );
};

export default ClientDetail;