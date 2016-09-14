module.exports = {
    // backgroundColor: 'rgba(0,0,0,0)',
    
    color: ['#ed9678','#e7dac9','#cb8e85','#f3f39d','#c8e49c',
            '#f16d7a','#f3d999','#d3758f','#dcc392','#2e4783',
            '#82b6e9','#ff6347','#a092f1','#0a915d','#eaf889',
            '#6699FF','#ff6666','#3cb371','#d5b158','#38b6b6'],
    
    dataRange: {
        color:['#cb8e85','#e7dac9'],
        textStyle: {
            color: '#333'
        }
    },

    bar: {
        barMinHeight: 0,
        // barWidth: null,
        barGap: '30%',
        barCategoryGap : '20%',
        itemStyle: {
            normal: {
                // color:
                barBorderColor: '#fff',
                barBorderRadius: 0,
                barBorderWidth: 1,
                label: {
                    show: false
                    // position: 'right'|'inside'|'left'|'right'|'top'|'bottom'
                    // textStyle: null
                }
            },
            emphasis: {
                // color:
                barBorderColor: 'rgba(0,0,0,0)',
                barBorderRadius: 0,
                barBorderWidth: 1,
                label: {
                    show: false
                    // position: 'right'|'inside'|'left'|'right'|'top'|'bottom'
                    // textStyle: null
                }
            }
        }
    },

    line: {
        itemStyle: {
            normal: {
                // color:
                label: {
                    show: false
                    // position: 'right'|'inside'|'left'|'right'|'top'|'bottom'
                    // textStyle: null
                },
                lineStyle: {
                    width: 2,
                    type: 'solid',
                    shadowColor : 'rgba(0,0,0,0)',
                    shadowBlur: 5,
                    shadowOffsetX: 3,
                    shadowOffsetY: 3
                }
            },
            emphasis: {
                // color: 
                label: {
                    show: false
                    // position: 'right'|'inside'|'left'|'right'|'top'|'bottom'
                    // textStyle: null
                }
            }
        },
        //smooth : false,
        //symbol: null,
        symbolSize: 2,
        //symbolRotate : null,
        showAllSymbol: false
    },
    
    k: {
        // barWidth : null
        // barMaxWidth : null
        itemStyle: {
            normal: {
                color: '#fe9778',
                color0: '#e7dac9',
                lineStyle: {
                    width: 1,
                    color: '#f78766',
                    color0: '#f1ccb8'
                }
            },
            emphasis: {
                // color: 
                // color0: 
            }
        }
    },

    pie: {
        center : ['50%', '50%'],
        radius : [0, '75%'],
        clockWise : false,
        startAngle: 90,
        minAngle: 0,
        selectedOffset: 10,
        itemStyle: {
            normal: {
                // color:
                borderColor: '#fff',
                borderWidth: 1,
                label: {
                    show: true,
                    position: 'outer',
                  textStyle: {color: '#1b1b1b'},
                  lineStyle: {color: '#1b1b1b'}
                    // textStyle: null
                },
                labelLine: {
                    show: true,
                    length: 20,
                    lineStyle: {
                        // color: 
                        width: 1,
                        type: 'solid'
                    }
                }
            }
        }
    },
    
    map: {
        mapType: 'china',
        mapLocation: {
            x : 'center',
            y : 'center'
            // width
            // height
        },
        showLegendSymbol : true,
        itemStyle: {
            normal: {
                borderColor: '#fff',
                borderWidth: 1,
                areaStyle: {
                    color: '#ccc'//rgba(135,206,250,0.8)
                },
                label: {
                    show: false,
                    textStyle: {
                        color: 'rgba(139,69,19,1)'
                    }
                }
            },
            emphasis: {
                borderColor: 'rgba(0,0,0,0)',
                borderWidth: 1,
                areaStyle: {
                    color: '#f3f39d'
                },
                label: {
                    show: false,
                    textStyle: {
                        color: 'rgba(139,69,19,1)'
                    }
                }
            }
        }
    },
    
    force : {
        itemStyle: {
            normal: {
                label: {
                    show: false
                    // textStyle: null
                },
                nodeStyle : {
                    brushType : 'both',
                    strokeColor : '#a17e6e'
                },
                linkStyle : {
                    strokeColor : '#a17e6e'
                }
            },
            emphasis: {
                label: {
                    show: false
                    // textStyle: null
                },
                nodeStyle : {},
                linkStyle : {}
            }
        }
    },

    gauge : {
        axisLine: {
            show: true,
            lineStyle: {
                color: [[0.2, '#ed9678'],[0.8, '#e7dac9'],[1, '#cb8e85']], 
                width: 8
            }
        },
        axisTick: {
            splitNumber: 10,
            length :12,
            lineStyle: {
                color: 'auto'
            }
        },
        axisLabel: {
            textStyle: {
                color: 'auto'
            }
        },
        splitLine: {
            length : 18,
            lineStyle: {
                color: 'auto'
            }
        },
        pointer : {
            length : '90%',
            color : 'auto'
        },
        title : {
            textStyle: {
                color: '#333'
            }
        },
        detail : {
            textStyle: {
                color: 'auto'
            }
        }
    }
};
