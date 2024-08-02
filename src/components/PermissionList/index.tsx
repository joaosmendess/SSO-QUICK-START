import React, { useState, useEffect } from 'react';
import { styled } from '../../stitches.config';
import { Box, CircularProgress, Toolbar,  } from '@mui/material';
import { getPermissionGroups, deletePermissionGroupHasModule } from '../../services/auth';
import ErrorMessage from '../Messages/ErrorMessage';
import SuccessMessage from '../Messages/SuccessMessage';
import GenericTable from '../Table/GenericTable';
import DeleteDialog from '../DeleteDialog';
import LoadingDialog from '../LoadingDialog';
import { PermissionGroup } from '../../types';
import { useNavigate } from 'react-router-dom'; // Importa o hook useNavigate

const PermissionListContainer = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  padding: '1rem',
  '@media (max-width: 600px)': {
    padding: '0.5rem',
  },
});

const PermissionList: React.FC = () => {
  const navigate = useNavigate(); // Use o hook useNavigate para redirecionamento
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<null | string>(null);
  const [searchTerm, ] = useState('');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const fetchedPermissions = await getPermissionGroups();
        setPermissionGroups(fetchedPermissions);
      } catch (error) {
        setError('Erro ao carregar grupos de permissões');
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const handleDelete = (permissionId: string) => {
    setPermissionToDelete(permissionId);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setPermissionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (permissionToDelete) {
      setDeleteLoading(true);
      try {
        await deletePermissionGroupHasModule(Number(permissionToDelete));
        setPermissionGroups(permissionGroups.filter(pg => pg.id !== Number(permissionToDelete)));
        setSuccess('Permissão excluída com sucesso');
      } catch (error) {
        setError('Erro ao excluir permissão');
      } finally {
        setDeleteLoading(false);
        handleDialogClose();
      }
    }
  };

  const handleEdit = (permissionGroup: PermissionGroup) => {
    navigate(`/gerenciar-permissao/${permissionGroup.id}`, { state: { permissionGroup } });
  };


  const filteredPermissions = permissionGroups.filter(pg =>
    pg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = ['name', 'edit'];

  return (
    <PermissionListContainer maxWidth='lg' >
      <Toolbar />
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
   
      {loading ? (
        <CircularProgress />
      ) : (
        <GenericTable
          columns={columns}
          data={filteredPermissions}
          loading={loading}
          error={error}
          handleEdit={handleEdit} // Adiciona a função handleEdit
          handleDelete={handleDelete}
        />
      )}
      <DeleteDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
      <LoadingDialog open={deleteLoading} message="Por favor, aguarde..." />
    </PermissionListContainer>
  );
};

export default PermissionList;
