// src/views/pages/school/SchoolDetailPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import SchoolDetailsTable from '../../ui-component/schoolDetailsTable';
import MainCard from 'ui-component/cards/MainCard';

export default function SchoolDetailPage() {
  return (
    <MainCard>
      <SchoolDetailsTable />
    </MainCard>
  );
}
