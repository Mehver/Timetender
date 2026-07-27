import * as React from 'react';
// import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import {getRows, getTags, setRows, setTags} from './EventLogData';
import * as CSS from './Windows-EventListCss';
import {textColorCss} from "./Windows-EventListCss";

function Row(props) {

    const {row, tags} = props;
    const [open, setOpen] = React.useState(false);

    let rowTitleCss = {
        textDecoration: "line-through",
    };
    if (!row.finished) {
        rowTitleCss = {
            fontWeight: "bold",
        };
    }

    return (
        <React.Fragment>
            <TableRow
                sx={{'& > *': {borderBottom: 'unset'}}}
                style={{
                    backgroundColor: row.color,
                }}
            >
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                        style={textColorCss(row.color)}
                    >
                        {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                    </IconButton>
                </TableCell>
                <TableCell style={{
                    ...rowTitleCss,
                    ...CSS.col1Css,
                    ...textColorCss(row.color),
                }}>
                    {row.title}
                </TableCell>
                <TableCell style={{
                    ...CSS.col2Css,
                    ...textColorCss(row.color),
                }}>
                    {row.start}
                </TableCell>
                <TableCell style={{
                    ...CSS.col3Css,
                    ...textColorCss(row.color),
                }}>
                    {row.ddl}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={CSS.tableBodyCellCss} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 1}}>
                            <Table
                                size="small"
                                aria-label="purchases"
                                style={CSS.subTableLeftCss(row.history.length <= row.tags.length)}
                            >
                                <TableHead>
                                    <TableRow style={CSS.subTableTagRowCss}>
                                        <TableCell style={CSS.tagCol1Css}>
                                            <b>Type</b>
                                        </TableCell>
                                        <TableCell style={CSS.tagCol2Css}>
                                            <b>Tag</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{
                                    row.tags.map((tag) => {
                                        return tags.map((tags) => {
                                            if (tag.id === tags.id) {
                                                return (
                                                    <TableRow>
                                                        <TableCell style={CSS.tagCol1Css}>
                                                            {tags.type}
                                                        </TableCell>
                                                        <TableCell style={CSS.colorTag(tags.color)}>
                                                            {tags.tag}
                                                        </TableCell>
                                                        <TableCell/>
                                                    </TableRow>
                                                );
                                            }
                                        });
                                    })
                                }</TableBody>
                            </Table>
                            <Table
                                size="small"
                                aria-label="purchases"
                                style={CSS.subTableRightCss(row.history.length > row.tags.length)}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={CSS.tagCol1Css}>
                                            <b>Status</b>
                                        </TableCell>
                                        <TableCell style={CSS.tagCol2Css}>
                                            <b>Time</b>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>{
                                    row.history.map((historyRow) => (
                                        <TableRow>
                                            <TableCell style={CSS.tagCol1Css}>
                                                {historyRow.status}
                                            </TableCell>
                                            <TableCell style={CSS.tagCol1Css}>
                                                {historyRow.time}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }</TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default class List extends React.Component {

    componentDidMount() {
        window.windowsList_refreshRender = () => {
            this.forceUpdate();
        }
    }

    render() {

        const rows = getRows();
        const tags = getTags();

        return (
            <TableContainer component={Paper} style={CSS.tableCss}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell/>
                            <TableCell style={CSS.col1Css}>
                                <b>Event</b>
                            </TableCell>
                            <TableCell style={CSS.col2Css}>
                                <b>Start</b>
                            </TableCell>
                            <TableCell style={CSS.col3Css}>
                                <b>DDL</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <Row row={row} tags={tags}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}