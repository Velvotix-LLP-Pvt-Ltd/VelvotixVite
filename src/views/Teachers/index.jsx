// src/views/pages/school/SchoolDetailPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import TeachersDetailsTable from '../../ui-component/teachersDetailsTable';
import MainCard from 'ui-component/cards/MainCard';

export default function SchoolDetailPage() {
  return (
    <MainCard>
      <TeachersDetailsTable />
    </MainCard>
  );
}
