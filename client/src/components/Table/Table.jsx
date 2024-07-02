import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as constants from '../../utils/constants';
import Spinner from '../Spinner';
import { withRouter } from '../../utils/withRouter';
import { Table as BootstrapTable } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClone,
  faDownload,
  faGear,
  faRefresh,
  faSearch,
  faShare,
  faSort,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@mui/material';

class Table extends Component {
  state = {
    extraExpanded: [],
    expanded: [],
    sortingColumn: '',
    reverse: false
  };

  handleExpand = el => {
    const currentExpandedRows = this.state.expanded;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(el.id);
    const newExpandedRows = isRowCurrentlyExpanded
      ? currentExpandedRows.filter(id => id !== el.id)
      : currentExpandedRows.concat(el.id);
    this.setState({ expanded: newExpandedRows });
  };

  handleExtraExpand = el => {
    const currentExpandedRows = this.state.extraExpanded;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(el.id);

    const newExpandedRows = isRowCurrentlyExpanded
      ? currentExpandedRows
      : currentExpandedRows.concat(el.id);
    this.setState({ extraExpanded: newExpandedRows });
  };

  handleExtraCollapse = el => {
    const currentExpandedRows = this.state.extraExpanded;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(el.id);

    const newExpandedRows = !isRowCurrentlyExpanded
      ? currentExpandedRows
      : currentExpandedRows.filter(id => id !== el.id);
    this.setState({ extraExpanded: newExpandedRows });
  };

  renderHeader() {
    const { has2Headers, firstHeader, columns, actions, data, loading, updateCheckbox, isChecked } =
      this.props;
    return (
      <>
        {has2Headers && (
          <thead id="firstHeader" className="thead-dark">
            <tr key="firstHeader">
              {firstHeader.map((column, index) => {
                return (
                  <th
                    id="headerColumn"
                    className="header-text"
                    key={`firstHead${column.colName}${index}`}
                    colSpan={column.colSpan}
                  >
                    {column.colName}
                  </th>
                );
              })}
              {actions && actions.length > 0 && data && data.length > 0 && (
                <th colSpan={actions.length} />
              )}
            </tr>
          </thead>
        )}
        <thead id="secondHeader" className="thead-dark">
          <tr key="secondHeader">
            {columns.map((column, index) => {
              if (!column.extraRow) {
                return (
                  <th className="header-text" key={`secondHead${column.colName}${index}`}>
                    <div className="header-content">
                      {!loading && data && data.length > 0 && column.id === 'checkboxes' ? (
                        <>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              updateCheckbox(e);
                            }}
                          />
                        </>
                      ) : (
                        column.colName
                      )}
                      {column.sortable && (
                        <FontAwesomeIcon
                          icon={faSort}
                          onClick={() => {
                            let data = [];
                            this.setState(
                              {
                                sortingColumn:
                                  column.accessor !== this.state.sortingColumn
                                    ? column.accessor
                                    : this.state.sortingColumn,
                                reverse:
                                  column.accessor !== this.state.sortingColumn &&
                                  this.state.sortingColumn > 0
                                    ? false
                                    : !this.state.reverse
                              },
                              () => {
                                data = this.props.data.sort(
                                  constants.sortBy(this.state.sortingColumn, this.state.reverse)
                                );
                                this.props.updateData(data);
                              }
                            );
                          }}
                        />
                      )}
                    </div>
                  </th>
                );
              }
              return null;
            })}
            {actions && actions.length > 0 && data && data.length > 0 && (
              <th colSpan={actions.length} />
            )}
          </tr>
        </thead>
      </>
    );
  }

  onDoubleClick(onDetails, row) {
    const { idCol } = this.props;

    if (onDetails) {
      onDetails(idCol ? row[idCol] : row.id);
    }
  }

  renderRow(row, index) {
    const {
      actions,
      columns,
      extraRow,
      onExpand,
      noRowBackgroundChange,
      onDetails,
      handleExtraExpand,
      handleExtraCollapse,
      reduce,
      textHover
    } = this.props;
    const { extraExpanded } = this.state;

    let extraRowColCollapsed;
    let extraRowColExpanded;
    const items = [
      <Tooltip title={textHover} key={`tableRow${index}`}>
        <tr key={`tableRow${index}`} className={reduce ? 'reduce' : ''}>
          {columns.map((column, colIndex) => {
            let extraStyles = [];
            if (noRowBackgroundChange) {
              extraStyles.push({ backgroundColor: '#444' });
            }
            if (column.expand) {
              extraStyles.push({ cursor: 'pointer' });
            }
            if (column.extraRow) {
              extraRowColCollapsed = column.cell ? column.cell(row, column) : row[column.accessor];
              extraRowColExpanded = column.extraRowContent
                ? column.extraRowContent(row, column)
                : row[column.accessor];
              return null;
            }
            if (typeof column.cell === 'function') {
              return (
                <td
                  key={`tableCol${index}${colIndex}`}
                  style={column.expand ? { cursor: 'pointer' } : {}}
                  className={column.readOnly ? 'not-allowed' : ''}
                  onDoubleClick={() => {
                    if (
                      actions &&
                      actions.find(action => action === constants.TABLE_DETAILS) &&
                      !column.expand
                    ) {
                      this.onDoubleClick(onDetails, row);
                    }

                    column.expand && this.handleExpand(row);
                  }}
                >
                  {this.renderContent(column.cell(row, column))}
                </td>
              );
            }

            return (
              <td
                key={`tableCol${index}${colIndex}`}
                style={column.expand ? { cursor: 'pointer' } : {}}
                className={column.readOnly ? 'not-allowed' : ''}
                onDoubleClick={() => {
                  if (
                    actions &&
                    actions.find(action => action === constants.TABLE_DETAILS) &&
                    !column.expand
                  ) {
                    this.onDoubleClick(onDetails, row);
                  }

                  column.expand && this.handleExpand(row);
                }}
              >
                {this.renderContent(column.cell(row, column))}
              </td>
            );
          })}
          {actions && actions.length > 0 && this.renderActions(row)}
        </tr>
      </Tooltip>
    ];
    if (
      JSON.stringify(
        this.state.expanded.find(el => {
          return el === row.id;
        })
      )
    ) {
      items.push(
        <tr key={'row-expandable-' + row.id}>
          <td key={'col-expandable-' + row.id} colSpan={this.colspan()} style={{ padding: 0 }}>
            {onExpand(row)}
          </td>
        </tr>
      );
    }

    if (extraRow && extraRowColCollapsed) {
      items.push(
        <tr
          onClick={() => {
            if (
              !extraExpanded ||
              !JSON.stringify(
                extraExpanded.find(expanded =>
                  expanded.subject ? expanded.subject === row.subject : expanded === row.id
                )
              ) ||
              !JSON.stringify(
                extraExpanded.find(expanded =>
                  expanded.subject ? expanded.subject === row.subject : expanded === row.id
                )
              ).length > 0
            ) {
              typeof handleExtraExpand === 'function'
                ? this.setState({ extraExpanded: handleExtraExpand(extraExpanded, row) })
                : this.handleExtraExpand(row);
            }
          }}
          key={'row-expanded-' + row.id}
        >
          <td style={{ '--bs-table-bg-state': '#171819' }} colSpan={this.colspan()}>
            {' '}
            {extraExpanded &&
            JSON.stringify(
              extraExpanded.find(expanded =>
                expanded.subject ? expanded.subject === row.subject : expanded === row.id
              )
            ) &&
            JSON.stringify(
              extraExpanded.find(expanded =>
                expanded.subject ? expanded.subject === row.subject : expanded === row.id
              )
            ).length > 0 ? (
              <div className="close-container">
                <span
                  onClick={() => {
                    typeof handleExtraCollapse === 'function'
                      ? this.setState({ extraExpanded: handleExtraCollapse(extraExpanded, row) })
                      : this.handleExtraCollapse(row);
                  }}
                  aria-hidden="true"
                >
                  ×
                </span>
              </div>
            ) : null}
            <div
              className={
                extraExpanded &&
                JSON.stringify(
                  extraExpanded.find(expanded =>
                    expanded.subject ? expanded.subject === row.subject : expanded === row.id
                  )
                ) &&
                JSON.stringify(
                  extraExpanded.find(expanded =>
                    expanded.subject ? expanded.subject === row.subject : expanded === row.id
                  )
                ).length > 0
                  ? ''
                  : 'collapsed-extra-row'
              }
            >
              {extraExpanded &&
              JSON.stringify(
                extraExpanded.find(expanded =>
                  expanded.subject ? expanded.subject === row.subject : expanded === row.id
                )
              ) &&
              JSON.stringify(
                extraExpanded.find(expanded =>
                  expanded.subject ? expanded.subject === row.subject : expanded === row.id
                )
              ).length > 0
                ? extraRowColExpanded
                : extraRowColCollapsed}
            </div>
          </td>
        </tr>
      );
    }

    return items;
  }

  renderContent(content) {
    return content !== undefined ? content : <Spinner />;
  }

  renderActions(row) {
    const {
      actions,
      onAdd,
      onDetails,
      onConfig,
      onDelete,
      onEdit,
      onRestart,
      onShare,
      onDownload,
      onCopy,
      idCol
    } = this.props;

    let idColVal = idCol ? row[this.props.idCol] : row.id;

    return (
      <>
        {actions.find(el => el === constants.TABLE_ADD) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Add"
              id="add"
              onClick={() => {
                onAdd && onAdd();
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </td>
        )}
        {actions.find(el => el === constants.TABLE_DETAILS) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Details"
              id="details"
              onClick={() => {
                onDetails && onDetails(idColVal);
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </td>
        )}
        {actions.find(el => el === constants.TABLE_CONFIG) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Config"
              id="config"
              onClick={() => {
                onConfig && onConfig(idColVal);
              }}
            >
              <FontAwesomeIcon icon={faGear} />
            </span>
          </td>
        )}
        {actions.find(el => el === constants.TABLE_DELETE) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Delete"
              id="delete"
              onClick={() => {
                onDelete && onDelete(row);
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </span>
          </td>
        )}
        {actions.find(el => el === constants.TABLE_EDIT) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Edit"
              id="edit"
              onClick={() => {
                onEdit && onEdit();
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </td>
        )}
        {actions.find(el => el === constants.TABLE_RESTART) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Restart"
              id="restart"
              onClick={() => {
                onRestart && onRestart(row);
              }}
            >
              <FontAwesomeIcon icon={faRefresh} />
            </span>
          </td>
        )}
        {actions.find(el => el === constants.TABLE_COPY) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Copy"
              id="copy"
              onClick={() => {
                onCopy && onCopy(row);
              }}
            >
              <FontAwesomeIcon icon={faClone} />
            </span>
          </td>
        )}
        {actions.find(el => el === constants.TABLE_SHARE) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Share"
              id="share"
              onClick={() => {
                onShare && onShare(row);
              }}
            >
              <FontAwesomeIcon icon={faShare} />
            </span>
          </td>
        )}
        {actions.find(el => el === constants.TABLE_DOWNLOAD) && (
          <td className="khq-row-action khq-row-action-main action-hover">
            <span
              title="Download"
              id="download"
              onClick={() => {
                onDownload && onDownload(row);
              }}
            >
              <FontAwesomeIcon icon={faDownload} />
            </span>
          </td>
        )}
      </>
    );
  }

  renderLoading() {
    return (
      <tr>
        <td colSpan={this.colspan()} className="loading-rows">
          <Spinner />
        </td>
      </tr>
    );
  }

  renderNoContent() {
    const { noContent } = this.props;
    if (noContent) {
      if (typeof noContent === 'string') {
        return (
          <tr>
            <td colSpan={this.colspan()}>
              <div className="alert alert-warning mb-0" role="alert">
                {noContent}
              </div>
            </td>
          </tr>
        );
      }
      return noContent;
    }
    return (
      <tr>
        <td colSpan={this.colspan()}>
          <div className="alert alert-warning mb-0" role="alert">
            No data available
          </div>
        </td>
      </tr>
    );
  }

  colspan() {
    const { actions, columns } = this.props;

    return (
      columns.filter(column => !column.extraRow).length +
      (actions && actions.length ? actions.length : 0)
    );
  }

  render() {
    const { noStripes, loading, rowId } = this.props;
    let allItemRows = [];
    let data = this.props.data || [];

    data.forEach((item, index) => {
      if (rowId !== undefined) {
        index = rowId(item);
      }

      if (!item.id) {
        item.id = index;
      }
      const perItemRows = this.renderRow(item, index);
      allItemRows = allItemRows.concat(perItemRows);
    });

    return (
      <BootstrapTable bordered hover responsive striped={!noStripes} className={'m-0'}>
        {this.renderHeader()}
        <tbody>
          {loading
            ? this.renderLoading()
            : data && data.length > 0
              ? allItemRows
              : this.renderNoContent()}
        </tbody>
      </BootstrapTable>
    );
  }
}

Table.propTypes = {
  title: PropTypes.string,
  has2Headers: PropTypes.bool,
  isChecked: PropTypes.bool,
  firstHeader: PropTypes.arrayOf(
    PropTypes.shape({
      colName: PropTypes.string,
      colSpan: PropTypes.number
    })
  ),
  data: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      accessor: PropTypes.string,
      colName: PropTypes.string,
      type: PropTypes.string,
      readOnly: PropTypes.bool,
      cell: PropTypes.func
    })
  ),
  actions: PropTypes.array,

  onAdd: PropTypes.func,
  onDetails: PropTypes.func,
  onConfig: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onRestart: PropTypes.func,
  onShare: PropTypes.func,
  onDownload: PropTypes.func,
  updateCheckbox: PropTypes.func,
  onCopy: PropTypes.func,

  idCol: PropTypes.string,
  toPresent: PropTypes.array,
  noContent: PropTypes.any,
  handleExtraExpand: PropTypes.func,
  handleExtraCollapse: PropTypes.func,
  loading: PropTypes.bool,
  router: PropTypes.object,
  rowId: PropTypes.func,
  textHover: PropTypes.string,

  updateData: PropTypes.func,
  extraRow: PropTypes.bool,
  noRowBackgroundChange: PropTypes.bool,
  onExpand: PropTypes.func,
  reduce: PropTypes.bool,
  noStripes: PropTypes.bool
};

export default withRouter(Table);
