import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'shared/utils/axios';
import { API_PATH_DEVICES } from 'shared/utils/constant';

//types
import { DataDevice, DataDeviceDiagram, DataDeviceTraffic, NewDevice } from 'shared/types';
import { formatDate } from 'shared/utils/handleData';
import { deviceApi } from 'shared/api/device.api';
import { QueryParam } from 'shared/types/query';


export interface DeviceQuery extends QueryParam {
  filters?: string;
  siteId: string;
  type?: string;
  statusId?: number;
  floor?: string;
  typeOptional?: string;
}

export interface DiagramDeviceQuery extends QueryParam {
  filters?: string;
  siteId: string;
}

export interface TrafficDeviceQuery extends QueryParam {
  startDate: string;
  endDate: string;
  siteId: string;
}


interface paramsRebootDevice {
  siteId: string;
}

interface DeviceProps {
  initDeviceQuery?: DeviceQuery;
  initDiagramDeviceQuery?: DiagramDeviceQuery;
  initTrafficDeviceQuery?: TrafficDeviceQuery;
}



const useHandleDevice = ({ initDeviceQuery, initDiagramDeviceQuery, initTrafficDeviceQuery }: DeviceProps) => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isLoadingDiagrams, setIsLoadingDiagrams] = useState(false);
  const [isLoadingTraffics, setIsLoadingTraffics] = useState(false);
  const [isRefreshDevices, setIsRefreshDevices] = useState(false);
  const [isRefreshDiagrams, setIsRefreshDiagrams] = useState(false);
  const [isRefreshTraffics, setIsRefreshTraffics] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [deviceQuery, setDeviceQuery] = useState<DeviceQuery>(initDeviceQuery ?? {} as DeviceQuery);
  const [diagramQuery, setDiagramQuery] = useState<DiagramDeviceQuery>(initDiagramDeviceQuery ?? {} as DiagramDeviceQuery);
  const [trafficQuery, setTrafficQuery] = useState<TrafficDeviceQuery>(initTrafficDeviceQuery ?? {} as TrafficDeviceQuery);
  const [dataDevice, setDataDevice] = useState<DataDevice[]>([])
  const [dataDiagramDevice, setDataDiagramDevice] = useState<DataDeviceDiagram[]>([])
  const [dataTrafficDevice, setDataTrafficDevice] = useState<DataDeviceTraffic>()


  const fetchDataDevice = async (newQuery?: DeviceQuery) => {
    try {
      setIsLoadingDevices(true);
      const { data } = await deviceApi.findAll(newQuery ?? deviceQuery)
      if (data.code === 0) {
        setTotalPages(data.data.totalPages);
        setTotalResults(data.data.total);
        const formattedDate = formatDate(data.data.data, ['manufacturer_date']);
        setDataDevice(data.data.data)
        return formattedDate;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const fetchDiagramDevice = async (newQuery?: DiagramDeviceQuery) => {
    setIsLoadingDiagrams(true)
    try {
      const { data } = await deviceApi.findAllDiagram(newQuery ?? diagramQuery)
      if (data.code === 0) {
        setDataDiagramDevice(data.data.data)
        return data.data.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setIsLoadingDiagrams(false)
    }
  };

  const fetchTrafficDevice = async (newQuery?: TrafficDeviceQuery) => {
    setIsLoadingTraffics(true)
    try {
      const { data } = await deviceApi.findAllTraffic(newQuery ?? trafficQuery)
      if (data.code === 0) {
        setDataTrafficDevice(data.data.data)
        return data.data.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setIsLoadingTraffics(false);
    }
  };

  const handleAddDevice = async (dataBody: NewDevice) => {
    try {
      const res = await axios.post(
        `${API_PATH_DEVICES.addDevice}`,
        {
          ...dataBody
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-device-successfully' }), {
          variant: 'success'
        });
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'add-failed' }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const handleEditDevice = async (id: string, dataBody: NewDevice) => {
    try {
      const { data } = await deviceApi.update({ id }, dataBody)
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-device-successfully' }), {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), {
          variant: 'error'
        });
      }
      return data;
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };
  const handleUpdateLocation = async (payload: Partial<NewDevice>) => {
    try {
      const { id, lat, lng } = payload;
      const { data } = await deviceApi.updateLocation({ id: id }, { lat, lng });
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-device-successfully' }), {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), {
          variant: 'error'
        });
      }
      return data;
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const deleteDevice = async (id: string) => {
    try {
      const { data } = await deviceApi.delete({ id })
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-device-successfully' }), {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-failed' }), {
          variant: 'error'
        });
      }
      return data;
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const refreshDevice = async () => {
    try {
      setIsRefreshDevices(true);
      const { data } = await deviceApi.refreshDevices()
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-device-successfully' }), {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-failed' }), {
          variant: 'error'
        });
      }
      return data;
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    } finally {
      setIsRefreshDevices(false);
    }
  }

  const refreshTrafficDevice = async () => {
    setIsRefreshTraffics(true)
    try {
      const { data } = await deviceApi.refreshTrafficDevices()
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-device-successfully' }), {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-failed' }), {
          variant: 'error'
        });
      }
      return data;

    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    } finally {
      setIsRefreshTraffics(false)
    }
  };

  const refreshDiagramDevice = async () => {
    setIsRefreshDiagrams(true)
    try {
      const { data } = await deviceApi.refreshDiagramDevices()
      if (data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-device-successfully' }), {
          variant: 'success'
        });
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-failed' }), {
          variant: 'error'
        });
      }
      return data.data;

    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
    finally {
      setIsRefreshDiagrams(false)
    }
  };

  const rebootDevice = async (params: paramsRebootDevice, macAddress?: string, confirm?: boolean) => {
    if (params.siteId && confirm && macAddress) {
      try {
        const res = await axios.post(
          `${API_PATH_DEVICES.rebootDevice}`,
          {
            macAddress: macAddress
          },
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'reboot-device-successfully' }), {
            variant: 'success'
          });
          return res.data;
        } else {
          enqueueSnackbar(intl.formatMessage({ id: 'reboot-failed' }), {
            variant: 'error'
          });
          return res.data;
        }
      } catch {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    }
  };

  return {
    dataDevice, dataDiagramDevice, dataTrafficDevice,
    deviceQuery, setDeviceQuery,
    trafficQuery, setTrafficQuery,
    diagramQuery, setDiagramQuery,
    isLoadingDevices,
    isLoadingDiagrams,
    isLoadingTraffics,
    isRefreshDevices,
    isRefreshTraffics,
    isRefreshDiagrams,
    totalPages,
    totalResults,
    fetchDataDevice,
    fetchDiagramDevice,
    fetchTrafficDevice,
    handleAddDevice,
    handleEditDevice,
    handleUpdateLocation,
    deleteDevice,
    refreshDevice,
    rebootDevice,
    refreshDiagramDevice,
    refreshTrafficDevice
  };
};

export default useHandleDevice;
