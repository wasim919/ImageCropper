import React from 'react';
import PropTypes from 'prop-types';

const Message = ({ msg, type }) => {
  const classType =
    type === 'info'
      ? 'alert alert-info alert-dismissible fade show'
      : 'alert alert-danger alert-dismissible fade show';
  return (
    <div className={classType} role='alert'>
      {msg}
      <button
        type='button'
        className='close'
        data-dismiss='alert'
        aria-label='Close'
      >
        <span aria-hidden='true'>&times;</span>
      </button>
    </div>
  );
};

Message.propTypes = {
  msg: PropTypes.string.isRequired,
};

export default Message;
