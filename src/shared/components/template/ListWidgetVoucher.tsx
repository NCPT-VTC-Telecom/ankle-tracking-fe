import { useTheme } from '@mui/material/styles';
import { useIntl } from 'react-intl';

// project-imports
import { EcommerceMetrix } from 'shared/components/organisms/statistics';
import { MainComponent, Money, Box } from 'iconsax-react';

interface DataWidget {
  orderNumber: number;
  totalNetProfit: number;
  totalGrossProfit: number;
}

interface ListWidgetVouchersProps {
  dataWidget: DataWidget;
}

function calculatePercentageProfit(totalNetProfit: number, totalGrossProfit: number) {
  // Ensure no division by zero
  if (totalGrossProfit === 0) {
    return 0;
  }

  const profitMargin = (totalNetProfit / totalGrossProfit) * 100;
  return profitMargin.toFixed(2); // Round to two decimal places
}

function ListWidgetVoucher({ dataWidget }: ListWidgetVouchersProps) {
  const theme = useTheme();
  const intl = useIntl();

  const profitMargin = calculatePercentageProfit(dataWidget.totalNetProfit, dataWidget.totalGrossProfit);

  return (
    <div className="grid grid-cols-4 gap-4 max-2xl:grid-cols-3 max-xl:grid-cols-2 max-md:grid-cols-1">
      <EcommerceMetrix
        primary={intl.formatMessage({ id: 'orders-number' })}
        secondary={dataWidget.orderNumber}
        color={theme.palette.primary.main}
        iconPrimary={Box}
        unit={` ${intl.formatMessage({ id: 'order-unit' })}`}
      />
      <EcommerceMetrix
        primary={intl.formatMessage({ id: 'net-profit' })}
        secondary={dataWidget.totalNetProfit}
        color={theme.palette.success.dark}
        iconPrimary={Money}
        unit={` ${intl.formatMessage({ id: 'vnd' })}`}
      />
      <EcommerceMetrix
        primary={intl.formatMessage({ id: 'gross-profit' })}
        secondary={dataWidget.totalGrossProfit}
        color={theme.palette.success.main}
        iconPrimary={Money}
        unit={` ${intl.formatMessage({ id: 'vnd' })}`}
      />
      <EcommerceMetrix
        primary={intl.formatMessage({ id: 'gross-profit-margin' })}
        secondary={profitMargin}
        color={theme.palette.warning.dark}
        iconPrimary={MainComponent}
        unit="%"
      />
    </div>
  );
}

export default ListWidgetVoucher;
